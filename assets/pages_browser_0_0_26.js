class T extends Error{cause;constructor(e,t){super(e),this.cause=t,Object.setPrototypeOf(this,new.target.prototype)}TplParseError(e){return this.name="TplParseError",this.message=e,this.ParseError(),this}TplRuntimeError(e){return this.name="TplRuntimeError",this.message=e,this.ParseError(),this}TplNameResolutionError(e){return this.name="TplNameResolutionError",this.message=e,this.ParseError(),this}ParseError(){Error.captureStackTrace&&Error.captureStackTrace(this,this.constructor)}static ParseError(e,t,i){const r=t.slice(0,i).split(/\n/),s=r.length,o=r[s-1].length+1,c=`${e} at line ${s}, col ${o}:

  ${t.split(/\n/)[s-1]}
  ${" ".repeat(o-1)}^`,h=new T(c);throw h.name="TplParseError",h}static RuntimeError(e,t,i,r){const s=t.split(`
`),o=Math.max(i-3,0),c=Math.min(s.length,i+3),h=s.slice(o,c).map((l,a)=>{const d=a+o+1;return(d===i?" >> ":"    ")+d+"| "+l}).join(`
`),f=r?`${r}:${i}
`:`line ${i}
`,u=new T(f+h+`

`+e.message,e);throw u.name=e.name||"TplRuntimeError",u}static NameResolutionError(e){const t=new T(`TplNameResolutionError: ${e}`);throw t.name="TplNameResolutionError",t}static FileResolutionError(e){const t=new T(`TplFileResolutionError: Could not find template at path: ${e}`);throw t.name="TplFileResolutionError",t}log(){}}const P=(n,e,t,i)=>{let r,s;return Array.isArray(e.autoTrim)?(r=e.autoTrim[1],s=e.autoTrim[0]):r=s=e.autoTrim,(t||t===!1)&&(r=t),(i||i===!1)&&(s=i),!s&&!r?n:r==="slurp"&&s==="slurp"?n.trim():(r==="_"||r==="slurp"?n=n.trimStart():(r==="-"||r==="nl")&&(n=n.replace(/^(?:\r\n|\n|\r)/,"")),s==="_"||s==="slurp"?n=n.trimEnd():(s==="-"||s==="nl")&&(n=n.replace(/(?:\r\n|\n|\r)$/,"")),n)},I={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},A=n=>I[n],b=n=>{const e=String(n);return/[&<>"']/.test(e)?e.replace(/[&<>"']/g,A):e},$={autoEscape:!0,autoFilter:!1,autoTrim:[!1,"nl"],cache:!1,cacheFilepaths:!0,debug:!1,escapeFunction:b,filterFunction:n=>String(n),functionHeader:"",parse:{exec:"",interpolate:"=",raw:"~"},plugins:[],rmWhitespace:!1,tags:["<%","%>"],useWith:!1,varName:"it",defaultExtension:".tpl"},v=(async function(){}).constructor,N=(n,e,t)=>{const i=n.config,r=t&&t.async?v:Function;try{return new r(i.varName,"options",n.compileToString.call(n,e,t))}catch(s){throw s instanceof SyntaxError?n.TplErr.TplNameResolutionError(`Bad template syntax

`+s.message+`
`+Array(s.message.length+1).join("=")+`
`+n.compileToString.call(n,e,t)+`
`):s}};function M(n,e){const t=this.config,i=e&&e.async,r=this.compileBody,s=this.parse.call(this,n);let o=`${t.functionHeader}
let include = (template, data) => this.render(template, data, options);
let includeAsync = (template, data) => this.renderAsync(template, data, options);

let __tpl = {res: "", e: this.config.escapeFunction, f: this.config.filterFunction${t.debug?', line: 1, templateStr: "'+n.replace(/\\|"/g,"\\$&").replace(/\r\n|\n|\r/g,"\\n")+'"':""}};

function layout(path, data) {
  __tpl.layout = path;
  __tpl.layoutData = data;
}${t.debug?"try {":""}${t.useWith?"with("+t.varName+"||{}){":""}

${r.call(this,s)}
if (__tpl.layout) {
  __tpl.res = ${i?"await includeAsync":"include"} (__tpl.layout, {...${t.varName}, body: __tpl.res, ...__tpl.layoutData});
}
${t.useWith?"}":""}${t.debug?"} catch (e) { this.RuntimeErr(e, __tpl.templateStr, __tpl.line, options.filepath) }":""}
return __tpl.res;
`;if(t.plugins)for(let c=0;c<t.plugins.length;c++){const h=t.plugins[c];h.processFnString&&(o=h.processFnString(o,t))}return o}function C(n){const e=this.config;let t=0;const i=n.length;let r="";for(t;t<i;t++){const s=n[t];if(typeof s=="string")r+="__tpl.res+='"+s+`'
`;else{const o=s.t;let c=s.val||"";e.debug&&(r+="__tpl.line="+s.lineNo+`
`),o==="r"?(e.autoFilter&&(c="__tpl.f("+c+")"),r+="__tpl.res+="+c+`
`):o==="i"?(e.autoFilter&&(c="__tpl.f("+c+")"),e.autoEscape&&(c="__tpl.e("+c+")"),r+="__tpl.res+="+c+`
`):o==="e"&&(r+=c+`
`)}}return r}class S{cache;constructor(){this.cache={}}define(e,t){this.cache[e]=t}get(e){return this.cache[e]}remove(e){delete this.cache[e]}reset(){this.cache={}}load(e){this.cache={...this.cache,...e}}}const x=/`(?:\\[\s\S]|\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})*}|(?!\${)[^\\`])*`/g,E=/'(?:\\[\s\w"'\\`]|[^\n\r'\\])*?'/g,_=/"(?:\\[\s\w"'\\`]|[^\n\r"\\])*?"/g,w=n=>n.replace(/[.*+\-?^${}()|[\]\\]/g,"\\$&"),O=(n,e)=>n.slice(0,e).split(`
`).length;function W(n){const e=this.config;let t=[],i=!1,r=0;const s=e.parse;if(e.plugins)for(let l=0;l<e.plugins.length;l++){const a=e.plugins[l];a.processTemplate&&(n=a.processTemplate(n,e))}e.rmWhitespace&&(n=n.replace(/[\r\n]+/g,`
`).replace(/^\s+|\s+$/gm,"")),x.lastIndex=0,E.lastIndex=0,_.lastIndex=0;function o(l,a){l&&(l=P(l,e,i,a),l&&(l=l.replace(/\\|'/g,"\\$&").replace(/\r\n|\n|\r/g,"\\n"),t.push(l)))}const c=[s.exec,s.interpolate,s.raw].reduce(function(l,a){return l&&a?l+"|"+w(a):a?w(a):l},""),h=new RegExp(w(e.tags[0])+"(-|_)?\\s*("+c+")?\\s*","g"),f=new RegExp("'|\"|`|\\/\\*|(\\s*(-|_)?"+w(e.tags[1])+")","g");let u;for(;u=h.exec(n);){const l=n.slice(r,u.index);r=u[0].length+u.index;const a=u[1],d=u[2]||"";o(l,a),f.lastIndex=r;let p,y=!1;for(;p=f.exec(n);)if(p[1]){const g=n.slice(r,p.index);h.lastIndex=r=f.lastIndex,i=p[2],y={t:d===s.exec?"e":d===s.raw?"r":d===s.interpolate?"i":"",val:g};break}else{const g=p[0];if(g==="/*"){const m=n.indexOf("*/",f.lastIndex);m===-1&&this.TplErr.TplParseError("unclosed comment",n,p.index),f.lastIndex=m}else g==="'"?(E.lastIndex=p.index,E.exec(n)?f.lastIndex=E.lastIndex:this.TplErr.TplParseError("unclosed string",n,p.index)):g==='"'?(_.lastIndex=p.index,_.exec(n)?f.lastIndex=_.lastIndex:this.TplErr.TplParseError("unclosed string",n,p.index)):g==="`"&&(x.lastIndex=p.index,x.exec(n)?f.lastIndex=x.lastIndex:this.TplErr.TplParseError("unclosed string",n,p.index))}y?(e.debug&&(y.lineNo=O(n,u.index)),t.push(y)):this.TplErr.TplParseError("unclosed tag",n,u.index)}if(o(n.slice(r,n.length),!1),e.plugins)for(let l=0;l<e.plugins.length;l++){const a=e.plugins[l];a.processAST&&(t=a.processAST(t,e))}return t}function F(n,e){const t=e.async?this.templatesAsync:this.templatesSync;if(this.resolvePath&&this.readFile&&!n.startsWith("@")){const r=this.resolvePath(n,e);e.filepath=r;const s=t?.get(r);if(this.config.cache&&s)return s;const o=this.readFile(r),c=this.compile(o,e);return this.config.cache&&t?.define(r,c),c}const i=t?.get(n);if(i)return i;throw this.TplErr.TplNameResolutionError(`Failed to get template '${n}'`),new Error(`Template not found: ${n}`)}function B(n,e={},t){const i={...t,async:!1};return(typeof n=="string"?F.call(this,n,i):n).call(this,e,i)}function L(n,e={},t){const i={...t,async:!0},r=typeof n=="string"?F.call(this,n,i):n;return Promise.resolve(r.call(this,e,i))}function Q(n,e={}){return this.compile(n,{async:!1}).call(this,e,{async:!1})}function j(n,e={}){const t=this.compile(n,{async:!0});return Promise.resolve(t.call(this,e,{async:!0}))}class k{config=$;templates=new S;templatesSync=new S;templatesAsync=new S;filepathCache={};TplErr=new T;resolvePath;readFile;constructor(e={}){this.config={...$,...e},this.resolvePath=t=>t,this.readFile=t=>{throw new Error("readFile not implemented: "+t)}}withConfig(e){this.config={...this.config,...e}}loadTemplate(e,t,i){const r=i?.async?this.templatesAsync:this.templatesSync;typeof t=="string"?r.define(e,this.compile(t,i)):r.define(e,t)}compile(e,t){return N(this,e,t)}compileToString(e,t){return M.call(this,e,t)}compileBody(e){return C.call(this,e)}parse(e){return W.call(this,e)}render(e,t,i){return B.call(this,e,t,i)}renderAsync(e,t,i){return L.call(this,e,t,i)}renderString(e,t){return Q.call(this,e,t)}renderStringAsync(e,t){return j.call(this,e,t)}}class R extends k{}const H=new R({cache:!0});globalThis.TplToHtml=H;export{R as Tpl};
