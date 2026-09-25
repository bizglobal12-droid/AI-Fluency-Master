/* AI Fluency Master Academy - V1.1 */
document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY="afm-progress", CHAPTERS=7, PASS_MARK=70;
    function getProgress(){
        const defaults={completedChapters:[],quizzesPassed:[],finalQuizScore:null,finalQuizPassed:false,certificateUnlocked:false,certificateId:null,lastUpdated:null};
        try{return Object.assign(defaults,JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}"));}catch(e){return defaults;}
    }
    function saveProgress(p){p.lastUpdated=new Date().toISOString();localStorage.setItem(STORAGE_KEY,JSON.stringify(p));window.dispatchEvent(new CustomEvent("afm-progress-updated"));}
    function markChapterComplete(n){const p=getProgress();if(!p.completedChapters.includes(n)){p.completedChapters.push(n);p.completedChapters.sort((a,b)=>a-b);saveProgress(p);}updateProgressUI();}
    function currentChapter(){const m=location.pathname.match(/chapter(\d+)\.html/i);return m?Number(m[1]):null;}
    function addChapterCompletionUI(){
        const n=currentChapter();if(!n)return;
        const section=document.createElement("section");section.className="container";
        section.innerHTML="<div class='card progress-complete-card'><h2>Chapter "+n+" Progress</h2><p id='chapterProgressMessage'>Mark this chapter complete after you finish reading and reviewing it.</p><button id='completeChapterBtn' class='btn' type='button'></button><a class='btn secondary' href='../progress.html'>View My Progress</a></div>";
        const main=document.querySelector("main");if(!main)return;main.appendChild(section);
        const btn=document.getElementById("completeChapterBtn"),msg=document.getElementById("chapterProgressMessage");
        function render(){const done=getProgress().completedChapters.includes(n);btn.textContent=done?"✓ Chapter Completed":"✓ Mark Chapter Complete";btn.disabled=done;if(done)msg.textContent="Completed! Your course progress has been saved on this device.";}
        btn.addEventListener("click",()=>markChapterComplete(n));render();
    }
    function addProgressLink(){
        document.querySelectorAll("nav").forEach(nav=>{
            if([...nav.querySelectorAll("a")].some(a=>a.getAttribute("href")==="progress.html"||a.getAttribute("href")==="../progress.html"))return;
            const a=document.createElement("a");a.href=location.pathname.includes("/chapters/")?"../progress.html":"progress.html";a.textContent="Progress";
            if(nav.tagName.toLowerCase()==="ul"){const li=document.createElement("li");li.appendChild(a);nav.appendChild(li);}else nav.appendChild(a);
        });
    }
    function updateProgressUI(){const p=getProgress(),percent=Math.round((p.completedChapters.length/CHAPTERS)*100);document.querySelectorAll("[data-afm-progress]").forEach(e=>e.textContent=percent+"%");document.querySelectorAll("[data-afm-chapters]").forEach(e=>e.textContent=p.completedChapters.length+"/"+CHAPTERS);}
    document.querySelectorAll(".current-year").forEach(e=>e.textContent=new Date().getFullYear());
    document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener("click",function(e){const t=document.querySelector(this.getAttribute("href"));if(t){e.preventDefault();t.scrollIntoView({behavior:"smooth"});}}));
    const revealElements=document.querySelectorAll(".reveal");function reveal(){const trigger=innerHeight*.85;revealElements.forEach(e=>{if(e.getBoundingClientRect().top<trigger)e.classList.add("active");});}addEventListener("scroll",reveal);reveal();
    const bar=document.getElementById("progress-bar");function reading(){if(!bar)return;const h=document.documentElement.scrollHeight-innerHeight;bar.style.width=(h>0?(scrollY/h)*100:0)+"%";}addEventListener("scroll",reading);reading();
    const sections=document.querySelectorAll("section[id]"),navLinks=document.querySelectorAll("nav a");function nav(){let cur="";sections.forEach(s=>{if(scrollY>=s.offsetTop-120)cur=s.id;});navLinks.forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#"+cur));}addEventListener("scroll",nav);nav();
    if(!localStorage.getItem(STORAGE_KEY))saveProgress(getProgress());
    addProgressLink();addChapterCompletionUI();updateProgressUI();
    window.AFM={getProgress,saveProgress,markChapterComplete,PASS_MARK,CHAPTERS,STORAGE_KEY};
    console.log("AI Fluency Master Academy V1.1 Loaded Successfully.");
});