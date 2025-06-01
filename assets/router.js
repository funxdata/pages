//#region src/core/check_link.ts
var check_link_default = (route) => {
	document.addEventListener("click", function(event) {
		const target = event.target.closest("a");
		if (target instanceof HTMLAnchorElement) {
			event.preventDefault();
			route.navigate(target.href);
		}
	});
};

//#endregion
//#region src/core/check_url.ts
var check_url_default = (url_src) => {
	const info = new URL(url_src);
	if (info.origin != globalThis.location.origin) console.log("网站将跳转至其它网页:", url_src);
	return info;
};

//#endregion
//#region src/core/router_map.ts
var router_map_default = class {
	path;
	hook;
	already;
	before;
	after;
	leave;
	constructor(path, callbackfn) {
		this.path = path;
		this.hook = callbackfn;
	}
	async do_hookhandler() {
		if (this.already != void 0) await this.already();
		if (this.before != void 0) await this.before();
		if (this.hook != void 0) await this.hook();
		if (this.after != void 0) await this.after();
		this.hook();
	}
	async leave_handler() {
		if (this.leave != void 0) await this.leave();
	}
};

//#endregion
//#region src/core/route_node.ts
var RouteNode = class {
	node = "";
	child = [];
	cross;
	constructor(node) {
		this.node = node;
	}
	add(node) {
		this.child.push(node);
	}
	sum() {
		return this.child.length;
	}
};

//#endregion
//#region src/core/route_match.ts
const match_rout_map = (path_src, rts) => {
	for (let index = 0; index < rts.length; index++) if (path_src == rts[index].path) return rts[index];
	return void 0;
};
var route_match_default = async (redirt_path, rts) => {
	const local_path = globalThis.location.pathname;
	const res = match_rout_map(redirt_path, rts);
	if (res != void 0) await res.leave_handler();
	if (local_path == redirt_path) {
		const res$1 = match_rout_map(redirt_path, rts);
		if (res$1 != void 0) await res$1.do_hookhandler();
		return;
	}
	/** 
	
	*  执行回调
	
	* 
	
	* 
	
	**/
	const redirt_res = match_rout_map(redirt_path, rts);
	if (redirt_res != void 0) await redirt_res.do_hookhandler();
	return void 0;
};

//#endregion
//#region src/app.ts
var PagesRouterInfo = class {
	routnode;
	routers = [];
	constructor() {
		this.watch_interface();
		this.routnode = new RouteNode("/");
	}
	watch_interface() {
		check_link_default(this);
	}
	on(path, hooks) {
		const rt = new router_map_default(path, hooks);
		this.routers.push(rt);
		return rt;
	}
	_on_routs() {}
	_on_rout_node() {}
	off(path) {
		if (this.routers === void 0) return false;
		for (let index = 0; index < this.routers.length; index++) if (this.routers[index].path == path) {
			this.routers.splice(index, 1);
			return true;
		}
		return false;
	}
	_off_routs() {}
	_off_rout_node() {}
	navigate(redirt_url) {
		let info = check_url_default(redirt_url);
		this._match(info.pathname);
		this._pushState(redirt_url);
	}
	async _match(path) {
		await route_match_default(path.trim(), this.routers);
	}
	_pushState(redirt_url) {
		history.pushState(null, "", redirt_url);
	}
};
const GlobalPagesRouter = new PagesRouterInfo();
const url = globalThis.location.href;
document.addEventListener("DOMContentLoaded", function() {
	GlobalPagesRouter.navigate(url);
});

//#endregion