/* K'DEE MOM — GAME ENGINE (portrait 360x640 canvas) */
(function(){
var CW=360,CH=640,curRoom=0,verb="look",keys=0,timer=780,inv=[],usedHS={},questItems={},paused=false,gameOver=false;
var canvas=document.getElementById("scene"),ctx=canvas.getContext("2d");
var hotspots=makeHS();
var invEmoji={banana:"\uD83C\uDF4C",duck:"\uD83E\uDD86",bible:"\uD83D\uDCD6",flashlight:"\uD83D\uDD26",necronomicon:"\uD83D\uDCDA",shovel:"\u26CF\uFE0F",wrench:"\uD83D\uDD27",towel:"\uD83E\uDDF4",book:"\uD83D\uDCDA",tidepen:"\uD83E\uDDF4"};

/* K'Dee position & walking */
var kdeeX=180,kdeeY=560,kdeeTargetX=180,kdeeTargetY=560,kdeeWalking=false,walkSpeed=3;
var walkAnim=0,walkFrame=0;

function drawKdee(c,x,y){
  var bob=kdeeWalking?Math.sin(walkAnim*0.3)*2:0;
  var legOff=kdeeWalking?Math.sin(walkAnim*0.4)*3:0;
  // Body (pink top)
  D(c,x-7,y-38+bob,14,26,P.pink);
  // Jeans
  D(c,x-6,y-12+bob,12,14,"#4169E1");
  // Head
  c.fillStyle=P.skin;c.beginPath();c.arc(x,y-44+bob,9,0,Math.PI*2);c.fill();
  // Hair
  c.fillStyle=P.hair;c.beginPath();c.arc(x,y-50+bob,9,Math.PI,2*Math.PI);c.fill();
  D(c,x-9,y-48+bob,4,6,P.hair);D(c,x+5,y-48+bob,4,6,P.hair);
  // Eyes
  c.fillStyle=P.eye;c.fillRect(x-4,y-44+bob,2,2);c.fillRect(x+2,y-44+bob,2,2);
  // Smile
  c.fillStyle=P.pink;c.fillRect(x-2,y-40+bob,4,1);
  // Feet (animate when walking)
  D(c,x-5+legOff,y-2+bob,4,4,P.skin);D(c,x+1-legOff,y-2+bob,4,4,P.skin);
}

function updateWalk(){
  if(!kdeeWalking)return;
  walkAnim++;
  var dx=kdeeTargetX-kdeeX,dy=kdeeTargetY-kdeeY;
  var dist=Math.sqrt(dx*dx+dy*dy);
  if(dist<walkSpeed+1){
    kdeeX=kdeeTargetX;kdeeY=kdeeTargetY;
    kdeeWalking=false;walkAnim=0;
    return;
  }
  kdeeX+=dx/dist*walkSpeed;
  kdeeY+=dy/dist*walkSpeed;
}

function walkTo(tx,ty,cb){
  // Clamp to walkable area (lower portion of canvas)
  var clampY=Math.max(420,Math.min(600,ty));
  var clampX=Math.max(20,Math.min(340,tx));
  kdeeTargetX=clampX;kdeeTargetY=clampY;
  kdeeWalking=true;
  if(cb){
    var check=setInterval(function(){
      if(!kdeeWalking){clearInterval(check);cb();}
    },50);
  }
}

function drawScene(){
  ctx.clearRect(0,0,CW,CH);
  var room=ROOMS[curRoom];
  if(room&&room.bg)room.bg(ctx);
  drawKdee(ctx,Math.round(kdeeX),Math.round(kdeeY));
  // hotspot outlines on hover
  var hs=hotspots[curRoom]||[];
  hs.forEach(function(h){
    if(h._hover){
      ctx.strokeStyle="rgba(255,215,0,0.5)";ctx.lineWidth=1;
      ctx.strokeRect(h.x,h.y,h.w,h.h);
    }
  });
  // Room name overlay
  ctx.fillStyle="rgba(0,0,0,0.55)";ctx.fillRect(0,0,CW,22);
  ctx.fillStyle=P.gold;ctx.font="bold 10px monospace";ctx.textAlign="center";
  ctx.fillText(room.name,CW/2,15);ctx.textAlign="left";
}

/* Game loop for animation */
var animRunning=false;
function gameLoop(){
  if(!animRunning)return;
  updateWalk();
  drawScene();
  requestAnimationFrame(gameLoop);
}
function startLoop(){
  if(!animRunning){animRunning=true;gameLoop();}
}

function updateHUD(){
  document.getElementById("hk").textContent="\uD83D\uDD11 KEYS: "+keys+"/3";
  document.getElementById("hr").textContent=ROOMS[curRoom].name;
  var m=Math.floor(timer/60),s=timer%60;
  document.getElementById("hs").textContent="\u23F0 "+m+":"+(s<10?"0":"")+s;
}

function setDesc(t){document.getElementById("desc-text").textContent=t;}

function showDlg(name,text,emoji){
  var d=document.getElementById("dlg");
  d.classList.add("on");
  document.getElementById("dlg-portrait").textContent=emoji||"\uD83D\uDC69";
  document.getElementById("dlg-name").textContent=name;
  document.getElementById("dlg-text").textContent=text;
  document.getElementById("dlg-choices").innerHTML="";
  paused=true;
}

function hideDlg(){
  document.getElementById("dlg").classList.remove("on");
  paused=false;
}

function goToRoom(roomIdx){
  curRoom=roomIdx;
  kdeeX=180;kdeeY=560;kdeeTargetX=180;kdeeTargetY=560;kdeeWalking=false;
  drawScene();updateHUD();setDesc("Entered "+ROOMS[curRoom].name);
  updateNav();
}

function doVerb(h,forceVerb){
  var v=forceVerb||verb;
  var uid=curRoom+"_"+h.id+"_"+v;
  // Navigation - goto rooms
  if(h.open&&h.open.indexOf("goto:")===0&&(v==="open"||forceVerb==="open")){
    var targetRoom=parseInt(h.open.split(":")[1]);
    // Walk toward the door then go
    var doorX=h.x+h.w/2,doorY=Math.max(420,Math.min(600,h.y+h.h));
    walkTo(doorX,doorY,function(){
      goToRoom(targetRoom);
    });
    return;
  }
  var txt=h[v];
  if(!txt){setDesc("Can't "+v+" the "+h.name+".");return;}
  // Walk to the hotspot first, then do the action
  var hx=h.x+h.w/2,hy=Math.max(420,Math.min(600,h.y+h.h+20));
  walkTo(hx,hy,function(){
    if(h.hasKey&&v==="push"&&!usedHS[uid]){
      keys++;usedHS[uid]=true;
      showDlg("K'DEE",txt+"\n\uD83D\uDD11 KEY FOUND! ("+keys+"/3)","\uD83D\uDD11");
      updateHUD();
      if(keys>=3)setTimeout(function(){winGame();},1200);
      return;
    }
    if(h.quest&&v==="take"&&!usedHS[uid]){
      inv.push(h.quest);usedHS[uid]=true;
      questItems[h.quest]=true;
      showDlg("K'DEE",txt,invEmoji[h.quest]||"\uD83C\uDF81");
      updateInv();return;
    }
    if(v==="take"&&!h.quest&&!h.take){setDesc("Can't take that.");return;}
    if(usedHS[uid]){setDesc("Already did that.");return;}
    if(v!=="look")usedHS[uid]=true;
    showDlg(h.name,txt,"\uD83D\uDC69");
  });
}

function updateInv(){
  var bar=document.getElementById("inv-bar");bar.innerHTML="";
  inv.forEach(function(it){
    var s=document.createElement("div");s.className="inv-slot";
    s.textContent=invEmoji[it]||"\u2753";s.title=it;bar.appendChild(s);
  });
  for(var i=inv.length;i<8;i++){
    var s=document.createElement("div");s.className="inv-slot";bar.appendChild(s);
  }
}

function updateNav(){
  var bar=document.getElementById("room-nav");bar.innerHTML="";
  var hs=hotspots[curRoom]||[];
  var doors=hs.filter(function(h){return h.open&&h.open.indexOf("goto:")===0;});
  doors.forEach(function(h){
    var b=document.createElement("div");b.className="room-btn";
    b.textContent="\u25B6 "+h.name;
    b.addEventListener("click",function(){
      if(paused||gameOver)return;
      doVerb(h,"open");
    });
    bar.appendChild(b);
  });
}

function getCanvasCoords(e){
  var r=canvas.getBoundingClientRect();
  var sx=CW/r.width,sy=CH/r.height;
  var cx,cy;
  if(e.touches){cx=e.touches[0].clientX;cy=e.touches[0].clientY;}
  else{cx=e.clientX;cy=e.clientY;}
  return{x:(cx-r.left)*sx,y:(cy-r.top)*sy};
}

function findHS(mx,my){
  var hs=hotspots[curRoom]||[];
  for(var i=hs.length-1;i>=0;i--){
    var h=hs[i];
    if(mx>=h.x&&mx<=h.x+h.w&&my>=h.y&&my<=h.y+h.h)return h;
  }
  return null;
}

canvas.addEventListener("click",function(e){
  if(paused||gameOver)return;
  var p=getCanvasCoords(e);
  var h=findHS(p.x,p.y);
  if(h){
    doVerb(h);
  } else {
    // Walk to clicked spot
    walkTo(p.x,p.y);
    setDesc("Nothing interesting there.");
  }
});

canvas.addEventListener("touchstart",function(e){
  if(paused||gameOver)return;
  e.preventDefault();
  var p=getCanvasCoords(e);
  var h=findHS(p.x,p.y);
  if(h){
    doVerb(h);
  } else {
    walkTo(p.x,p.y);
    setDesc("Nothing interesting there.");
  }
},{passive:false});

canvas.addEventListener("mousemove",function(e){
  var p=getCanvasCoords(e);
  var hs=hotspots[curRoom]||[];
  var found=null;
  hs.forEach(function(h){
    h._hover=false;
    if(p.x>=h.x&&p.x<=h.x+h.w&&p.y>=h.y&&p.y<=h.y+h.h){found=h;h._hover=true;}
  });
  if(found){setDesc(verb.toUpperCase()+" "+found.name);canvas.style.cursor="pointer";}
  else{setDesc("What should K'Dee do?");canvas.style.cursor="crosshair";}
});

document.querySelectorAll(".vb").forEach(function(b){
  b.addEventListener("click",function(){
    document.querySelectorAll(".vb").forEach(function(v){v.classList.remove("active");});
    b.classList.add("active");verb=b.dataset.v;
    setDesc(verb.toUpperCase()+" what?");
  });
});

document.getElementById("dlg-continue").addEventListener("click",hideDlg);
document.getElementById("dlg").addEventListener("click",function(e){
  if(e.target===document.getElementById("dlg"))hideDlg();
});

function winGame(){
  gameOver=true;paused=true;
  var d=document.getElementById("dlg");d.classList.add("on");
  document.getElementById("dlg-portrait").textContent="\uD83C\uDF89";
  document.getElementById("dlg-name").textContent="YOU WIN!";
  var m=Math.floor((780-timer)/60),s=(780-timer)%60;
  document.getElementById("dlg-text").textContent="K'Dee found all 3 keys in "+m+"m "+s+"s! She grabs her purse, kisses the kids, and heads out the door. Have fun, don't die!";
  document.getElementById("dlg-choices").innerHTML='<div class="dlg-ch" id="play-again">PLAY AGAIN</div>';
  document.getElementById("play-again").addEventListener("click",function(){
    location.reload();
  });
}

function loseGame(){
  gameOver=true;paused=true;
  var d=document.getElementById("dlg");d.classList.add("on");
  document.getElementById("dlg-portrait").textContent="\u23F0";
  document.getElementById("dlg-name").textContent="TIME'S UP!";
  document.getElementById("dlg-text").textContent="K'Dee is officially late. The kids are feral. The dog ate something suspicious. "+keys+"/3 keys found. Try again?";
  document.getElementById("dlg-choices").innerHTML='<div class="dlg-ch" id="play-again2">TRY AGAIN</div>';
  document.getElementById("play-again2").addEventListener("click",function(){
    location.reload();
  });
}

var timerInterval;
function startTimer(){
  timerInterval=setInterval(function(){
    if(paused||gameOver)return;
    timer--;updateHUD();
    if(timer<=0){clearInterval(timerInterval);loseGame();}
  },1000);
}

document.getElementById("startbtn").addEventListener("click",function(){
  document.getElementById("title").style.display="none";
  document.getElementById("game").classList.add("on");
  kdeeX=180;kdeeY=560;
  drawScene();updateHUD();updateInv();updateNav();
  startLoop();
  startTimer();
});

document.getElementById("qbtn").addEventListener("click",function(){
  if(confirm("Quit game?")){
    gameOver=true;animRunning=false;clearInterval(timerInterval);
    document.getElementById("game").classList.remove("on");
    document.getElementById("title").style.display="flex";
  }
});

})();