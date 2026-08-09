const MIME_BY_EXT = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 5;

function getExt(name) {
  const match = /\.([a-zA-Z0-9]+)$/.exec(name || '');
  return match ? match[1].toLowerCase() : '';
}

function json(data, status = 200) {
  return Response.json(data, { status });
}

async function handleUpload(request, env) {
  if (request.method !== 'POST') {
    return json({ success: false, error: 'Method not allowed' }, 405);
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return json({ success: false, error: 'Nieprawidłowe dane formularza.' }, 400);
  }

  const files = formData.getAll('files').filter((f) => f instanceof File && f.size > 0);

  if (files.length === 0) {
    return json({ success: false, error: 'Brak plików do przesłania.' }, 400);
  }
  if (files.length > MAX_FILES) {
    return json({ success: false, error: `Maksymalnie ${MAX_FILES} plików na raz.` }, 400);
  }

  const uploaded = [];

  for (const file of files) {
    const ext = getExt(file.name);
    const mime = MIME_BY_EXT[ext];

    if (!mime) {
      return json({ success: false, error: `Niedozwolony typ pliku: "${file.name}". Dozwolone: PDF, DOC(X), XLS(X), PPT(X).` }, 400);
    }
    if (file.size > MAX_FILE_SIZE) {
      return json({ success: false, error: `Plik "${file.name}" przekracza limit 10 MB.` }, 400);
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `zapytania/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}`;

    await env.UPLOADS.put(key, file.stream(), {
      httpMetadata: { contentType: mime },
      customMetadata: { originalName: file.name },
    });

    uploaded.push({ name: file.name, key });
  }

  return json({ success: true, files: uploaded });
}

async function handleDownload(request, env, key) {
  if (request.method !== 'GET') {
    return json({ success: false, error: 'Method not allowed' }, 405);
  }

  const object = await env.UPLOADS.get(key);
  if (!object) {
    return new Response('Nie znaleziono pliku.', { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  const originalName = (object.customMetadata && object.customMetadata.originalName) || key.split('/').pop();
  headers.set('Content-Disposition', `attachment; filename="${originalName.replace(/"/g, '')}"`);

  return new Response(object.body, { headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/upload') {
      return handleUpload(request, env);
    }

    if (url.pathname.startsWith('/api/files/')) {
      const key = decodeURIComponent(url.pathname.replace('/api/files/', ''));
      return handleDownload(request, env, key);
    }

    return env.ASSETS.fetch(request);
  },
};
