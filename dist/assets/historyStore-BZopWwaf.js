import{c as p,b as n,p as i,d as u,s as l}from"./index-g-43JoMB.js";/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=p("Heart",[["path",{d:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",key:"c3ymky"}]]),H=n()(i((s,o)=>({favorites:[],toggleFavorite:e=>{const t=o().favorites;s({favorites:t.includes(e)?t.filter(c=>c!==e):[...t,e]})},isFavorite:e=>o().favorites.includes(e)}),{name:"pkdx-favorites",storage:u(()=>l)})),y=12,k=n()(i((s,o)=>({recent:[],counts:{},recordView:(e,t)=>{const{recent:c,counts:a}=o(),f=[{id:e,name:t},...c.filter(d=>d.name!==t)].slice(0,y),r=a[t],v={...a,[t]:{id:e,name:t,count:((r==null?void 0:r.count)??0)+1}};s({recent:f,counts:v})},clearHistory:()=>s({recent:[],counts:{}})}),{name:"pkdx-history",storage:u(()=>l)}));function S(s,o=6){return Object.values(s).sort((e,t)=>t.count-e.count).slice(0,o).map(({id:e,name:t})=>({id:e,name:t}))}export{x as H,k as a,S as s,H as u};
