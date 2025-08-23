export type TagType = "r" | "e" | "i" | "";

export type TemplateObject {
  t: TagType;
  val: string;
  lineNo?: number;
}

export type AstObject = string | TemplateObject;