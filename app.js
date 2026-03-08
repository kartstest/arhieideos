const STORAGE="videoLibrary";

let library=JSON.parse(localStorage.getItem(STORAGE)) || {
cams:[],
fakes:[],
favorites:[]
};

function save(){

localStorage.setItem(STORAGE,JSON.stringify(library));

}

let category="cams";
let page=1;

const perPage=20;

const grid=document.getElementById("videoGrid");

const search=document.getElementById("search");

let searchText="";

function render(){

let videos=[...library[category]];

if(searchText){

videos=videos.filter(v=>v.title.toLowerCase().includes(searchText));

}

const total=Math.ceil(videos.length/perPage);

if(page>total)page=total||1;

const start=(page-1)*perPage;

videos=videos.slice(start,start+perPage);

grid.innerHTML="";

videos.forEach(v=>{

const card=document.createElement("div");

card.className="video-card";

const fav=library.favorites.includes(v.watch);

card.innerHTML=`

<div class="favorite ${fav?'active':''}">♥</div>

<img class="video-thumb" src="${v.poster}">

<div class="video-title">${v.title}</div>

`;

const img=card.querySelector(".video-thumb");

let timer;

img.onmouseenter=()=>{

timer=setTimeout(()=>img.src=v.preview,500);

};

img.onmouseleave=()=>{

clearTimeout(timer);

img.src=v.poster;

};

card.onclick=()=>openPlayer(v.watch);

card.querySelector(".favorite").onclick=e=>{

e.stopPropagation();

toggleFav(v.watch);

};

grid.appendChild(card);

});

document.getElementById("pageInfo").innerText=`Page ${page}/${total||1}`;

}

function toggleFav(id){

if(library.favorites.includes(id)){

library.favorites=library.favorites.filter(v=>v!==id);

}else{

library.favorites.push(id);

}

save();

render();

}

function openPlayer(url){

playerContainer.innerHTML=`<iframe src="${url}" allowfullscreen></iframe>`;

playerModal.classList.remove("hidden");

}

closePlayer.onclick=()=>{

playerModal.classList.add("hidden");

playerContainer.innerHTML="";

};

playerOverlay.onclick=closePlayer.onclick;

document.addEventListener("keydown",e=>{

if(e.key==="Escape")closePlayer.onclick();

});

prevPage.onclick=()=>{if(page>1){page--;render();}};

nextPage.onclick=()=>{page++;render();};

search.oninput=e=>{

searchText=e.target.value.toLowerCase();

page=1;

render();

};

/* NAVIGATION */

camsBtn.onclick=()=>{

category="cams";

page=1;

render();

};

fakesBtn.onclick=()=>{

category="fakes";

page=1;

render();

};

favoritesBtn.onclick=()=>{

grid.innerHTML="";

library.favorites.forEach(id=>{

const v=[...library.cams,...library.fakes].find(x=>x.watch===id);

if(!v)return;

const card=document.createElement("div");

card.className="video-card";

card.innerHTML=`

<img class="video-thumb" src="${v.poster}">

<div class="video-title">${v.title}</div>

`;

card.onclick=()=>openPlayer(v.watch);

grid.appendChild(card);

});

};

addBtn.onclick=()=>{

document.querySelector("main").classList.add("hidden");

addSection.classList.remove("hidden");

};

/* IMPORT EXPORT */

exportBtn.onclick=()=>{

const blob=new Blob([JSON.stringify(library,null,2)],{type:"application/json"});

const a=document.createElement("a");

a.href=URL.createObjectURL(blob);

a.download="video-library.json";

a.click();

};

importBtn.onclick=()=>{

const input=document.createElement("input");

input.type="file";

input.onchange=e=>{

const file=e.target.files[0];

const reader=new FileReader();

reader.onload=ev=>{

library=JSON.parse(ev.target.result);

save();

location.reload();

};

reader.readAsText(file);

};

input.click();

};

/* BULK IMPORT */

let parsed=[];

previewImport.onclick=()=>{

let raw;

try{

raw=JSON.parse(jsonInput.value);

}catch{

alert("Invalid JSON");

return;

}

parsed=raw.map(v=>{

const match=v.embed.match(/src="([^"]+)"/);

return{

title:v.title.replace(".mp4",""),

poster:v.poster,

preview:v.preview,

watch:match?match[1]:""

};

});

importCount.innerText=`Found ${parsed.length} videos`;

importPreview.innerHTML="";

parsed.forEach(v=>{

const d=document.createElement("div");

d.innerText=v.title;

importPreview.appendChild(d);

});

confirmImport.classList.remove("hidden");

};

confirmImport.onclick=()=>{

const cat=categorySelect.value;

parsed.forEach(v=>{

if(!library[cat].some(x=>x.watch===v.watch)){

library[cat].push(v);

}

});

save();

alert("Import Complete");

location.reload();

};

render();
