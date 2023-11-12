const name = "s";

const server = Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response(`${name} says Hi!`);
  },
});
