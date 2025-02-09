/* Use this file to declare any custom file extensions for importing */
/* Use this folder to also add/extend a package d.ts file, if needed. */

declare module '*.css';
declare module '*.svg' {
  const ref: string;
  export default ref;
}
declare module '*.bmp' {
  const ref: string;
  export default ref;
}
declare module '*.gif' {
  const ref: string;
  export default ref;
}
declare module '*.jpg' {
  const ref: string;
  export default ref;
}
declare module '*.jpeg' {
  const ref: string;
  export default ref;
}
declare module '*.png' {
  const ref: string;
  export default ref;
}
declare module '*.webp' {
  const ref: string;
  export default ref;
}
declare module '*.glsl' {
  const content: string;
  export default content;
}
declare module '*.glsl?raw' {
  const content: string;
  export default content;
}
declare module '*?worker' {
  const content: Worker;
  export default content;
}
declare module '*.obj' {
  const content: string;
  export default content;
}
declare module '*.obj?raw' {
  const content: string;
  export default content;
}
declare module '*.tgf' {
  const content: string;
  export default content;
}
declare module '*.tgf?raw' {
  const content: string;
  export default content;
}
declare module '*.dmat' {
  const content: string;
  export default content;
}
declare module '*.dmat?raw' {
  const content: string;
  export default content;
}
declare module '*.fbx' {
  const content: string;
  export default content;
}
declare module '*.fbx?raw' {
  const content: string;
  export default content;
}
declare module '*.fbx?arraybuffer' {
  const content: ArrayBuffer;
  export default content;
}
