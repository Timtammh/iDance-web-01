import { defineType, defineField, defineArrayMember } from "sanity";
const text = (name: string, required = false) =>
  defineField({
    name,
    type: "string",
    validation: (r) => (required ? r.required() : r),
  });
const rich = (name: string) =>
  defineField({
    name,
    type: "array",
    of: [defineArrayMember({ type: "block" })],
  });
const slug = defineField({
  name: "slug",
  type: "slug",
  options: { source: (doc) => String(doc.name || doc.title || "") },
  validation: (r) => r.required(),
});
const picture = (name: string, required = false) =>
  defineField({
    name,
    type: "image",
    options: { hotspot: true },
    fields: [
      {
        name: "alt",
        type: "string",
        title: "Alternative text",
        validation: (r) => r.required(),
      },
    ],
    validation: (r) => (required ? r.required() : r),
  });
const refs = (name: string, to: string) =>
  defineField({
    name,
    type: "array",
    of: [defineArrayMember({ type: "reference", to: [{ type: to }] })],
  });
const seo = defineField({
  name: "seo",
  type: "object",
  fields: [text("title"), { name: "description", type: "text" }],
});
const doc = (name: string, fields: ReturnType<typeof defineField>[]) =>
  defineType({ name, type: "document", fields });
export const schemaTypes = [
  doc("siteSettings", [
    picture("logo"),
    text("brandStatement", true),
    defineField({
      name: "navigation",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            text("label", true),
            defineField({
              name: "path",
              type: "string",
              description: "Local path beginning with /",
              validation: (r) => r.required().regex(/^\/(?!\/)/),
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "socialLinks",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            text("label", true),
            {
              name: "url",
              type: "url",
              validation: (r) => r.required().uri({ scheme: ["https"] }),
            },
          ],
        },
      ],
    }),
    defineField({
      name: "email",
      type: "string",
      validation: (r) => r.email(),
    }),
    text("phone"),
    seo,
  ]),
  doc("homePage", [
    text("headline", true),
    defineField({
      name: "description",
      type: "text",
      validation: (r) => r.required(),
    }),
    picture("heroImage"),
    refs("featuredProducts", "product"),
    refs("featuredVideos", "video"),
    text("productsHeading", true),
    text("videosHeading", true),
    text("cta", true),
  ]),
  doc("productCategory", [text("name", true), slug]),
  doc("product", [
    text("name", true),
    slug,
    defineField({
      name: "category",
      type: "reference",
      to: [{ type: "productCategory" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "images",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            { name: "alt", type: "string", validation: (r) => r.required() },
          ],
        }),
      ],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "summary",
      type: "text",
      validation: (r) => r.required(),
    }),
    rich("description"),
    defineField({
      name: "features",
      type: "array",
      of: [{ type: "string" }],
      description: "Use verified product facts only.",
    }),
    defineField({
      name: "specifications",
      type: "array",
      of: [
        { type: "object", fields: [text("label", true), text("value", true)] },
      ],
    }),
    defineField({ name: "manual", type: "file", options: { accept: ".pdf" } }),
    defineField({ name: "isPopular", type: "boolean", initialValue: false }),
    defineField({ name: "isNew", type: "boolean", initialValue: false }),
    refs("relatedProducts", "product"),
    seo,
  ]),
  doc("useCase", [
    text("title", true),
    slug,
    picture("image", true),
    text("description", true),
    refs("categories", "productCategory"),
  ]),
  doc("video", [
    text("title", true),
    picture("thumbnail", true),
    defineField({
      name: "url",
      type: "url",
      description:
        "YouTube watch URL or Vimeo numeric video URL. Leave empty until available.",
      validation: (r) => r.uri({ scheme: ["https"] }),
    }),
    text("category", true),
    defineField({
      name: "relatedProduct",
      type: "reference",
      to: [{ type: "product" }],
    }),
  ]),
  doc("newsPost", [
    text("title", true),
    slug,
    defineField({
      name: "date",
      type: "date",
      validation: (r) => r.required(),
    }),
    text("category", true),
    picture("cover", true),
    defineField({
      name: "excerpt",
      type: "text",
      validation: (r) => r.required(),
    }),
    rich("body"),
    seo,
  ]),
  doc("aboutPage", [text("headline", true), rich("body")]),
];
