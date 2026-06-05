const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { r2, BUCKET } = require('../r2');
const { prisma } = require('../prisma');
const { randomUUID } = require('crypto');

module.exports = async function (fastify) {
  const AUTH  = { onRequest: [fastify.authenticate] };
  const ADMIN = { onRequest: [fastify.requireAdmin] };

  fastify.post('/events/:id/images', ADMIN, async (req, reply) => {
    const parts = req.parts();
    const uploaded = [];
    for await (const part of parts) {
      if (part.type !== 'file') continue;
      const key = `events/${req.params.id}/${randomUUID()}-${part.filename}`;
      const chunks = [];
      for await (const chunk of part.file) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);
      await r2.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: part.mimetype,
      }));
      const image = await prisma.eventImage.create({
        data: { eventId: req.params.id, r2Key: key },
      });
      uploaded.push(image);
    }
    reply.code(201).send(uploaded);
  });

  fastify.get('/images/:id/url', AUTH, async (req, reply) => {
    const image = await prisma.eventImage.findUnique({ where: { id: req.params.id } });
    if (!image) return reply.code(404).send({ error: 'Not found' });
    const url = await getSignedUrl(r2, new GetObjectCommand({ Bucket: BUCKET, Key: image.r2Key }), { expiresIn: 3600 });
    return { url };
  });

  fastify.delete('/images/:id', ADMIN, async (req, reply) => {
    const image = await prisma.eventImage.findUnique({ where: { id: req.params.id } });
    if (!image) return reply.code(404).send({ error: 'Not found' });
    await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: image.r2Key }));
    await prisma.eventImage.delete({ where: { id: req.params.id } });
    reply.code(204).send();
  });
};
