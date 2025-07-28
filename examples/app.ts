    
    import PagesRouter  from "../types/router.ts";
    declare const GlobalPagesRouter: PagesRouter;
    GlobalPagesRouter.on("/home",async function(){
        console.log("hello home")
      })
      GlobalPagesRouter.on("/about",async function(){
        console.log("hello about")
      })
      GlobalPagesRouter.on("/test",async function(){
        console.log("hello test")
      })
      GlobalPagesRouter.on("/aaaa",async function(){
        console.log("hello aaa")
      })

      GlobalPagesRouter.on("/aaaa/bbb",async function(){
        console.log("hello /aaa/bbb")
      })

      GlobalPagesRouter.on("/aaaa/bbb/cc",async function(){
        console.log("hello /aaa/bbb/cc")
      })

      GlobalPagesRouter.on("/aaaa/bbb/dd",async function(){
        console.log("hello /aaa/bbb/dd")
      })
      GlobalPagesRouter.on("/aaaa/ccc",async function(){
        console.log("hello /aaa/ccc")
      })

      GlobalPagesRouter.on("/bbb",async function(){
        console.log("hello bbb")
      })
      
      console.log("........app..........")
      console.log("........info..........",GlobalPagesRouter)
      console.log("........app..........")
    console.log("this web-kit is info");
    GlobalPagesRouter.off("/test")
    console.log(".........111111.............")
    console.log(GlobalPagesRouter)
    console.log(".........111111.............")