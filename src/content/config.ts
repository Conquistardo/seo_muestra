import { defineCollection, z } from "astro:content";

const servicesCollection = defineCollection({
  type: "content",
  schema: z.object({
    order: z.number().int().min(1),
    name: z.string(),
    image: z.string().startsWith("/"),
    alt: z.string()
  })
});

export const collections = {
  services: servicesCollection
};
