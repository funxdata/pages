export default (url_src:string):URL=>{
    const info = new URL(url_src)
    if(info.origin!=globalThis.location.origin){
        globalThis.window.open(url_src, "_blank");
        console.log("网站将跳转至其它网页:",url_src)
    }
    return info;
}