/* K'DEE MOM — GAME ENGINE (portrait 360x640 canvas) */
(function(){
var CW=360,CH=640,curRoom=0,keys=0,timer=780,inv=[],usedHS={},questItems={},paused=false,gameOver=false;
/* Hearts: each container = 4 quarters. Start with 4 containers = 16 quarters */
var kdeeHearts=4,kdeeMaxHearts=4; // containers
var kdeeHP=16,kdeeMaxHP=16;       // quarters (kdeeMaxHP always = kdeeMaxHearts*4)
var canvas=document.getElementById("scene"),ctx=canvas.getContext("2d");
var hotspots=makeHS();
var invEmoji={banana:"\uD83C\uDF4C",duck:"\uD83E\uDD86",bible:"\uD83D\uDCD6",flashlight:"\uD83D\uDD26",necronomicon:"\uD83D\uDCDA",shovel:"\u26CF\uFE0F",wrench:"\uD83D\uDD27",towel:"\uD83E\uDDF4",book:"\uD83D\uDCDA",tidepen:"\uD83E\uDDF4",phone:"\uD83D\uDCF1"};
var verbLabels={use:"\u270B USE",take:"\uD83E\uDD1A TAKE",talk:"\uD83D\uDCAC TALK",open:"\uD83D\uDCE6 OPEN",push:"\uD83D\uDC4A PUSH"};

/* K'Dee position & walking */
var kdeeX=180,kdeeY=520,kdeeTargetX=180,kdeeTargetY=520,kdeeWalking=false,walkSpeed=4;
var walkAnim=0,frameTick=0;

/* Holly random encounter state */
var hollyRunning=false,hollyX=-40,hollyY=520,hollyTimer=Math.floor(400+Math.random()*200);
var hollyAnim=0,hollyMsg="",hollyMsgTimer=0,hollyCatchable=false;
var hollyTrip=false,hollyTripTimer=0;

/* Milo follow state — after Big Hug win he tags along for a few rooms */
var miloFollowing=false,miloRoomsLeft=0,miloFollowX=180,miloFollowY=540,miloFollowAnim=0;
var miloMsg="",miloMsgTimer=0;

/* Gwyneth follow state — after hug she drifts to living room in 3 rooms */
var gwynFollowing=false,gwynRoomsLeft=0,gwynFollowX=220,gwynFollowY=540,gwynFollowAnim=0;
var gwynMsg="",gwynMsgTimer=0;

/* Living room kids — who has been hugged/collected */
var livingRoomKids={milo:false,greyson:false,gwyneth:false,forest:false,daed:false,holly:false};
var hollyWasTripped=false;

/* Holly Meta Minigame — "SHE REFUSES" */
var hollyMetaActive=false,hollyMetaRound=0;
/* Special dialog backgrounds */
var greysonDialogActive=false,lintDialogActive=false;
window._lrk=livingRoomKids; // expose for room painter
window._ft=function(){return frameTick;}; // expose frameTick for room animations
function drawKdee(c,x,y){
  var breathe=Math.sin(frameTick*0.04)*1;
  var bob=kdeeWalking?Math.sin(walkAnim*0.3)*3.5:breathe*0.7;
  var legOff=kdeeWalking?Math.sin(walkAnim*0.4)*6:0;
  var armOff=kdeeWalking?Math.sin(walkAnim*0.4)*4:0;
  var sc=1.6;

  // Blink: flat eyes for 3 frames every ~220 frames
  var blinkPhase=frameTick%220;
  var blinking=blinkPhase<3;

  // HP expression tiers (quarters: 16=full, 8=half, 4=low, 0=fumes)
  var hpTired=kdeeHP<=8&&kdeeHP>4;
  var hpGrimace=kdeeHP<=4&&kdeeHP>0;
  var hpFumes=kdeeHP<=0;

  c.save();c.translate(x,y);c.scale(sc,sc);

  // Shadow
  c.save();c.globalAlpha=0.18;c.fillStyle="#000";
  c.beginPath();c.ellipse(0,2,12,4,0,0,Math.PI*2);c.fill();c.restore();

  // Legs
  D(c,-5+legOff,-4+bob,5,7,"#4169E1");
  D(c,1-legOff,-4+bob,5,7,"#4169E1");
  // Shoes with toe cap detail
  D(c,-6+legOff,2+bob,7,4,"#333");
  D(c,1-legOff,2+bob,7,4,"#333");
  c.fillStyle="rgba(255,255,255,0.08)";
  c.fillRect(-6+legOff,2+bob,3,2);c.fillRect(1-legOff,2+bob,3,2);

  // Body / shirt — gradient for depth
  var bodyGrad=c.createLinearGradient(0,-15+bob,0,0+bob);
  bodyGrad.addColorStop(0,"#FF85C8");bodyGrad.addColorStop(1,"#d94f96");
  c.fillStyle=bodyGrad;
  c.beginPath();
  c.moveTo(-8,-15+bob);c.lineTo(-9,-4+bob);c.lineTo(9,-4+bob);c.lineTo(8,-15+bob);
  c.closePath();c.fill();
  // Shirt centre stripe
  D(c,-1,-13+bob,2,9,"#FF9ED4");
  // Collar line
  c.strokeStyle="rgba(255,255,255,0.25)";c.lineWidth=0.8;
  c.beginPath();c.moveTo(-4,-15+bob);c.lineTo(0,-13+bob);c.lineTo(4,-15+bob);c.stroke();
  // Sleeve cuff hints
  c.strokeStyle="rgba(200,60,120,0.5)";c.lineWidth=0.7;
  c.beginPath();c.moveTo(-12,-5+bob-armOff);c.lineTo(-8,-5+bob-armOff);c.stroke();
  c.beginPath();c.moveTo(8,-5+bob+armOff);c.lineTo(12,-5+bob+armOff);c.stroke();

  // Skirt / jeans — slight gradient
  var skirtGrad=c.createLinearGradient(0,-6+bob,0,0+bob);
  skirtGrad.addColorStop(0,"#5070d0");skirtGrad.addColorStop(1,"#3050a0");
  c.fillStyle=skirtGrad;c.fillRect(-8,-6+bob,16,6);
  // Hem line
  c.strokeStyle="rgba(255,255,255,0.15)";c.lineWidth=0.6;
  c.beginPath();c.moveTo(-8,-6+bob);c.lineTo(8,-6+bob);c.stroke();

  // Arms
  D(c,-12,-15+bob-armOff,4,11,P.pink);
  D(c,8,-15+bob+armOff,4,11,P.pink);
  // Hands
  c.fillStyle=P.skin;
  c.beginPath();c.arc(-10,-4+bob-armOff,3,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(10,-4+bob+armOff,3,0,Math.PI*2);c.fill();

  // Head — radial gradient for roundness
  var headGrad=c.createRadialGradient(-3,-26+bob,2,0,-24+bob,12);
  headGrad.addColorStop(0,"#FFD0C0");headGrad.addColorStop(1,"#e8a090");
  c.fillStyle=headGrad;
  c.beginPath();c.arc(0,-24+bob,12,0,Math.PI*2);c.fill();

  // Hair — bezier curves for flowing strands
  c.fillStyle="#F0E68C";
  // Top cap
  c.beginPath();c.arc(0,-29+bob,12,Math.PI,2*Math.PI);c.fill();
  // Left side strand — curves inward slightly
  c.beginPath();
  c.moveTo(-12,-28+bob);
  c.bezierCurveTo(-14,-20+bob,-13,-10+bob,-11,-2+bob);
  c.bezierCurveTo(-10,2+bob,-8,3+bob,-7,1+bob);
  c.bezierCurveTo(-8,-8+bob,-9,-18+bob,-8,-28+bob);
  c.closePath();c.fill();
  // Right side strand
  c.beginPath();
  c.moveTo(12,-28+bob);
  c.bezierCurveTo(14,-20+bob,13,-10+bob,11,-2+bob);
  c.bezierCurveTo(10,2+bob,8,3+bob,7,1+bob);
  c.bezierCurveTo(8,-8+bob,9,-18+bob,8,-28+bob);
  c.closePath();c.fill();
  // Hair highlight
  c.fillStyle="rgba(255,255,210,0.3)";
  c.beginPath();c.arc(4,-31+bob,5,0,Math.PI*2);c.fill();

  // Eyes — with blink, HP tiers, sparkle
  if(blinking||hpFumes){
    // Blink / fumes: flat line eyes
    c.strokeStyle="#a06060";c.lineWidth=1;
    c.beginPath();c.moveTo(-6,-25+bob);c.lineTo(-1,-25+bob);c.stroke();
    c.beginPath();c.moveTo(1,-25+bob);c.lineTo(6,-25+bob);c.stroke();
  }else if(hpGrimace){
    // Low HP: droopy inner corners, small iris
    c.fillStyle="#fff";c.fillRect(-6,-25+bob,5,3);c.fillRect(1,-25+bob,5,3);
    c.fillStyle=P.eye;c.fillRect(-5,-24+bob,2,2);c.fillRect(2,-24+bob,2,2);
    // Droopy inner brows
    c.strokeStyle="#7a4040";c.lineWidth=0.8;
    c.beginPath();c.moveTo(-6,-27+bob);c.lineTo(-2,-26+bob);c.stroke();
    c.beginPath();c.moveTo(6,-27+bob);c.lineTo(2,-26+bob);c.stroke();
  }else if(hpTired){
    // Tired: half-lidded (top half of eye covered)
    c.fillStyle="#fff";c.fillRect(-6,-25+bob,5,4);c.fillRect(1,-25+bob,5,4);
    c.fillStyle=P.eye;c.fillRect(-5,-24+bob,3,3);c.fillRect(2,-24+bob,3,3);
    c.fillStyle=P.skin;c.fillRect(-6,-26+bob,5,2);c.fillRect(1,-26+bob,5,2);// lid droop
    c.fillStyle="#fff";c.fillRect(-5,-25+bob,1,1);c.fillRect(2,-25+bob,1,1);
  }else{
    // Normal: full eyes with sparkle
    c.fillStyle="#fff";
    c.fillRect(-6,-25+bob,5,4);c.fillRect(1,-25+bob,5,4);
    c.fillStyle=P.eye;
    c.fillRect(-5,-24+bob,3,3);c.fillRect(2,-24+bob,3,3);
    c.fillStyle="#fff";c.fillRect(-5,-25+bob,1,1);c.fillRect(2,-25+bob,1,1);
  }

  // Mouth — HP-synced
  if(hpFumes||hpGrimace){
    // Grimace / wavy stressed mouth
    c.strokeStyle="#a05050";c.lineWidth=1.2;
    c.beginPath();
    c.moveTo(-4,-19+bob);
    c.bezierCurveTo(-2,-21+bob,0,-17+bob,2,-19+bob);
    c.bezierCurveTo(3,-20+bob,4,-18+bob,4,-19+bob);
    c.stroke();
  }else if(hpTired){
    // Neutral / slight frown
    c.strokeStyle=P.pink;c.lineWidth=1.2;
    c.beginPath();c.arc(0,-18+bob,3,0.15*Math.PI,0.85*Math.PI);c.stroke();
  }else{
    // Normal smile
    c.strokeStyle=P.pink;c.lineWidth=1.2;
    c.beginPath();c.arc(0,-19+bob,4,0.1*Math.PI,0.9*Math.PI);c.stroke();
  }

  c.restore();
}

function updateWalk(){
  if(!kdeeWalking)return;
  walkAnim++;
  var spd=kdeeHP<=0?Math.max(1,walkSpeed+kdeeHP*0.3):kdeeHP<4?3:walkSpeed;
  var dx=kdeeTargetX-kdeeX,dy=kdeeTargetY-kdeeY;
  var dist=Math.sqrt(dx*dx+dy*dy);
  if(dist<spd+1){kdeeX=kdeeTargetX;kdeeY=kdeeTargetY;kdeeWalking=false;walkAnim=0;return;}
  kdeeX+=dx/dist*spd;kdeeY+=dy/dist*spd;
}

/* Holly random encounter: countdown and update */
var hollyStaring=false,hollyStareTimer=0;

var HOLLY_GREETINGS=["...hi.","...hey.","...oh.","...hello, mom.","...it's you.","...hi mom.","*slow blink*","...","...you're here.","...I thought I heard you."];
var HOLLY_GOODBYES=["...bye.","...okay.","...see you.","...later.","...I'll be around.","*silent nod*","...love you.","...okay, bye.","...take care.","...found any keys?"];
var HOLLY_STARES=["...",".......","............","...ok.","...I wasn't staring.","...just checking.","...hi.","...never mind."];
var HOLLY_SAFE_ROOMS=[10,11,14,15,16]; // No Holly in Jesus Bath, Basement, Maze
function updateHolly(){
  if(battleActive||paused||gameOver)return;
  if(hollyRunning){
    hollyAnim++;
    if(hollyMsgTimer>0)hollyMsgTimer--;
    if(hollyTrip){
      hollyTripTimer--;
      // Phase 1 (frames 60-40): collapsed on ground, slide slowly
      if(hollyTripTimer>40){hollyX+=0.5;}
      // Phase 2 (frames 40-0): scramble up and flee fast
      else{hollyX+=6;}
      if(hollyTripTimer<=0){
        hollyRunning=false;hollyTrip=false;hollyX=-40;hollyMsg="";hollyMsgTimer=0;hollyCatchable=false;hollyStaring=false;
        hollyTimer=Math.floor(500+Math.random()*300);
      }
      return;
    }
    hollyX+=3; // she moves slowly and quietly — that's what makes it unsettling
    // Occasional stare: Holly stops dead and stares for a moment
    if(!hollyStaring&&hollyX>100&&hollyX<180&&Math.random()<0.004){
      hollyStaring=true;hollyStareTimer=55;
      hollyMsg=HOLLY_STARES[Math.floor(Math.random()*HOLLY_STARES.length)];hollyMsgTimer=50;
    }
    if(hollyStaring){
      hollyStareTimer--;
      if(hollyStareTimer<=0){hollyStaring=false;}
      else return;// frozen in stare
    }
    if(hollyX>60&&hollyX<200&&hollyMsgTimer===0){
      hollyMsg=HOLLY_GREETINGS[Math.floor(Math.random()*HOLLY_GREETINGS.length)];hollyMsgTimer=80;
    }
    if(hollyX>230&&HOLLY_GREETINGS.indexOf(hollyMsg)>=0&&hollyMsgTimer<30){
      hollyMsg=HOLLY_GOODBYES[Math.floor(Math.random()*HOLLY_GOODBYES.length)];hollyMsgTimer=60;
      // Deal 1 damage
      kdeeHP=Math.max(0,kdeeHP-1);updateHUD();
    }
    if(hollyX>400){
      hollyRunning=false;hollyX=-40;hollyMsg="";hollyMsgTimer=0;hollyCatchable=false;hollyStaring=false;
      hollyTimer=Math.floor(400+Math.random()*200);
    }
    return;
  }
  if(HOLLY_SAFE_ROOMS.indexOf(curRoom)>=0)return;
  hollyTimer--;
  if(hollyTimer<=0&&Math.random()<0.05){
    hollyRunning=true;hollyX=-40;hollyY=Math.floor(460+Math.random()*40);hollyAnim=0;
    hollyCatchable=true;hollyMsg="";hollyMsgTimer=40;
    hollyTimer=Math.floor(400+Math.random()*200);
  }
}

/* Draw running Holly during encounter */
function drawHolly(c){
  if(!hollyRunning)return;
  var sc=1.8;

  if(hollyTrip){
    var phase=hollyTripTimer;
    c.save();c.translate(hollyX,hollyY);c.scale(sc,sc);
    if(phase>40){
      c.save();c.rotate(Math.PI/2);
      c.fillStyle="#DDA0DD";c.fillRect(-12,-4,24,8);
      c.fillStyle=P.skin;c.beginPath();c.arc(15,0,7,0,Math.PI*2);c.fill();
      // Bezier hair splayed on ground
      c.fillStyle="#654321";
      c.beginPath();c.arc(15,-4,7,Math.PI,2*Math.PI);c.fill();
      c.beginPath();c.moveTo(9,-4);c.bezierCurveTo(5,-12,-2,-14,-6,-10);c.bezierCurveTo(-4,-6,-2,-4,2,-4);c.fill();
      c.beginPath();c.moveTo(21,-4);c.bezierCurveTo(25,-12,30,-14,32,-10);c.bezierCurveTo(30,-6,28,-4,24,-4);c.fill();
      c.fillStyle=P.gold;c.font="bold 8px monospace";c.textAlign="center";
      c.fillText("*_*",15,-14+Math.sin(phase*0.3)*2);c.textAlign="left";
      D(c,-16,-6,8,4,"#8B668B");D(c,-16,2,8,4,"#8B668B");
      c.restore();
    } else {
      var wobble=Math.sin(phase*0.8)*(phase/40)*6;
      c.save();c.rotate(wobble*0.08);
      D(c,-5,-8,4,12,"#8B668B");D(c,2,-8,4,12,"#8B668B");
      c.fillStyle="#DDA0DD";c.beginPath();
      c.moveTo(-7,-20);c.lineTo(-8,-8);c.lineTo(8,-8);c.lineTo(7,-20);c.closePath();c.fill();
      D(c,-14,-20,4,14,"#DDA0DD");D(c,7,-20,4,14,"#DDA0DD");
      c.fillStyle=P.skin;c.beginPath();c.arc(0,-28,8,0,Math.PI*2);c.fill();
      // Bezier hair scrambling
      c.fillStyle="#654321";c.beginPath();c.arc(0,-32,8,Math.PI,2*Math.PI);c.fill();
      c.beginPath();c.moveTo(-8,-31);c.bezierCurveTo(-10,-22,-9,-12,-8,0+wobble);c.bezierCurveTo(-7,4,-5,4,-4,2);c.bezierCurveTo(-5,-8,-6,-20,-5,-31);c.fill();
      c.beginPath();c.moveTo(8,-31);c.bezierCurveTo(10,-22,9,-12,8,0-wobble);c.bezierCurveTo(7,4,5,4,4,2);c.bezierCurveTo(5,-8,6,-20,5,-31);c.fill();
      c.fillStyle="#fff";c.fillRect(-4,-30,3,4);c.fillRect(1,-30,3,4);
      c.fillStyle="#333";c.fillRect(-3,-29,2,3);c.fillRect(2,-29,2,3);
      c.restore();
    }
    c.restore();
    return;
  }

  var bob=Math.sin(hollyAnim*0.15)*1.5;
  var legSwing=Math.sin(hollyAnim*0.2)*4;
  c.save();c.translate(hollyX,hollyY);c.scale(sc,sc);
  // Very faint shadow
  c.save();c.globalAlpha=0.08;c.fillStyle="#000";
  c.beginPath();c.ellipse(0,2,10,3,0,0,Math.PI*2);c.fill();c.restore();
  // Long legs
  D(c,-5+legSwing,-8+bob,4,12,"#8B668B");
  D(c,2-legSwing,-8+bob,4,12,"#8B668B");
  D(c,-6+legSwing,3+bob,5,3,"#333");
  D(c,2-legSwing,3+bob,5,3,"#333");
  // Body — gradient
  var hbg=c.createLinearGradient(0,-20+bob,0,-8+bob);
  hbg.addColorStop(0,"#E8B0E8");hbg.addColorStop(1,"#B070B0");
  c.fillStyle=hbg;
  c.beginPath();
  c.moveTo(-7,-20+bob);c.lineTo(-8,-8+bob);c.lineTo(8,-8+bob);c.lineTo(7,-20+bob);
  c.closePath();c.fill();
  // Shirt seam
  c.strokeStyle="rgba(255,255,255,0.15)";c.lineWidth=0.6;
  c.beginPath();c.moveTo(0,-20+bob);c.lineTo(0,-8+bob);c.stroke();
  // Long arms
  D(c,-11,-20+bob,4,14,"#DDA0DD");
  D(c,7,-20+bob,4,14,"#DDA0DD");
  // Head — radial gradient
  var hhg=c.createRadialGradient(-2,-30+bob,2,0,-28+bob,8);
  hhg.addColorStop(0,"#FFD8CC");hhg.addColorStop(1,"#e0a090");
  c.fillStyle=hhg;
  c.beginPath();c.arc(0,-28+bob,8,0,Math.PI*2);c.fill();
  // Hair — long bezier strands
  c.fillStyle="#654321";
  c.beginPath();c.arc(0,-32+bob,8,Math.PI,2*Math.PI);c.fill();
  // Left strand — curves gently inward at bottom
  c.beginPath();
  c.moveTo(-8,-31+bob);
  c.bezierCurveTo(-10,-22+bob,-10,-10+bob,-8,2+bob);
  c.bezierCurveTo(-7,6+bob,-5,6+bob,-4,4+bob);
  c.bezierCurveTo(-5,-6+bob,-5,-20+bob,-4,-31+bob);
  c.fill();
  // Right strand
  c.beginPath();
  c.moveTo(8,-31+bob);
  c.bezierCurveTo(10,-22+bob,10,-10+bob,8,2+bob);
  c.bezierCurveTo(7,6+bob,5,6+bob,4,4+bob);
  c.bezierCurveTo(5,-6+bob,5,-20+bob,4,-31+bob);
  c.fill();
  // Eyes — half-lidded
  c.fillStyle="#fff";c.fillRect(-4,-29+bob,3,2);c.fillRect(1,-29+bob,3,2);
  c.fillStyle="#333";c.fillRect(-3,-29+bob,2,2);c.fillRect(2,-29+bob,2,2);
  // Slight smile
  c.strokeStyle="#c0a0b0";c.lineWidth=0.8;
  c.beginPath();c.arc(0,-23+bob,2.5,0.15*Math.PI,0.85*Math.PI);c.stroke();
  c.restore();

  if(hollyMsg){
    var alpha=Math.min(1,hollyMsgTimer/10);
    c.save();c.globalAlpha=alpha;
    c.font="bold 11px monospace";
    var tw=c.measureText(hollyMsg).width+18;
    var tx=Math.min(Math.max(hollyX,tw/2+5),355-tw/2);
    RR(c,tx-tw/2,hollyY-70,tw,20,4,"rgba(255,248,220,0.96)");
    c.strokeStyle="rgba(180,140,200,0.7)";c.lineWidth=1;
    c.beginPath();
    c.moveTo(tx-tw/2+4,hollyY-50);c.lineTo(tx-tw/2+4,hollyY-70);c.lineTo(tx+tw/2-4,hollyY-70);c.lineTo(tx+tw/2-4,hollyY-50);
    c.stroke();
    c.fillStyle="#2a1a3e";c.textAlign="center";
    c.fillText(hollyMsg,tx,hollyY-56);c.textAlign="left";
    c.restore();
  }
}

/* Milo follow: update position trailing K'Dee, random chatter */
var MILO_QUIPS=[
  "'Mom can I tell you something?'",
  "'MOM. Mom. Mommy. MOMMM.'",
  "'Did you know dinosaurs—'",
  "'I made you a drawing!'",
  "'Can we read later?'",
  "'...mom?'",
  "'The book said—'",
  "'I love you!'",
  "'Guess what chapter I'm on!'",
  "'So in this book ACTUALLY—'",
  "'Mom I have a VERY important question.'",
  "'Can I have a snack? Can I? Can I? Can I?'",
  "'Will you listen to me read?'",
  "'I found something cool!'",
  "'MOM look at this picture!'",
  "'Do you think dragons are real though?'",
  "'The main character reminds me of you.'",
  "'I named my dinosaur after you.'",
  "'I'm writing a book. You're the hero.'",
  "'Mom? I love you more than all the books.'",
  "'Did you know that ACTUALLY—'",
  "'Can we get a dog? Can we? CAN WE?'"
];
function updateMilo(){
  if(!miloFollowing)return;
  miloFollowAnim++;
  // Trail slightly behind K'Dee
  miloFollowX+=(kdeeX-30-miloFollowX)*0.12;
  miloFollowY+=(kdeeY-miloFollowY)*0.12;
  if(miloMsgTimer>0)miloMsgTimer--;
  // Random quips
  if(miloMsgTimer===0&&Math.random()<0.004){
    miloMsg=MILO_QUIPS[Math.floor(Math.random()*MILO_QUIPS.length)];miloMsgTimer=100;
  }
}
function drawMilo(c){
  if(!miloFollowing)return;
  var bob=Math.sin(miloFollowAnim*0.2)*2;
  var leg=Math.sin(miloFollowAnim*0.25)*5;
  var sc=1.6;
  c.save();c.translate(miloFollowX,miloFollowY);c.scale(sc,sc);
  // Shadow
  c.save();c.globalAlpha=0.1;c.fillStyle="#000";c.beginPath();c.ellipse(0,4,8,3,0,0,Math.PI*2);c.fill();c.restore();
  // Legs
  D(c,-4+leg,0,4,10,"#3498db");D(c,1-leg,0,4,10,"#3498db");
  // Shoes with tiny lace dot
  D(c,-5+leg,9,5,3,"#333");D(c,1-leg,9,5,3,"#333");
  c.fillStyle="rgba(255,255,255,0.2)";c.fillRect(-3+leg,10,2,1);c.fillRect(2-leg,10,2,1);
  // Body — gradient
  var mbg=c.createLinearGradient(0,-12+bob,0,0+bob);
  mbg.addColorStop(0,"#a8e0ff");mbg.addColorStop(1,"#5ab0d8");
  c.fillStyle=mbg;
  c.beginPath();c.moveTo(-6,-12+bob);c.lineTo(-7,0+bob);c.lineTo(7,0+bob);c.lineTo(6,-12+bob);c.closePath();c.fill();
  // Pocket
  c.strokeStyle="rgba(60,140,180,0.5)";c.lineWidth=0.7;
  c.strokeRect(-5,-8+bob,4,4);
  // Arms
  D(c,-10,-12+bob,4,9,"#87CEEB");D(c,6,-12+bob,4,9,"#87CEEB");
  // Book in hand (right arm)
  RR(c,6,-8+bob,8,10,2,"#e74c3c");
  c.fillStyle="#c0392b";c.fillRect(7,-7+bob,6,1);c.fillRect(7,-5+bob,6,1);c.fillRect(7,-3+bob,6,1);
  // Head — radial gradient
  var mhg=c.createRadialGradient(-2,-22+bob,2,0,-20+bob,8);
  mhg.addColorStop(0,"#FFD8C8");mhg.addColorStop(1,"#e8a080");
  c.fillStyle=mhg;
  c.beginPath();c.arc(0,-20+bob,8,0,Math.PI*2);c.fill();
  // Hair — shaggy kid bezier
  c.fillStyle="#654321";
  c.beginPath();c.arc(0,-24+bob,8,Math.PI,2*Math.PI);c.fill();
  // Shaggy left tuft
  c.beginPath();
  c.moveTo(-8,-24+bob);
  c.bezierCurveTo(-11,-28+bob,-9,-32+bob,-5,-30+bob);
  c.bezierCurveTo(-2,-28+bob,-1,-26+bob,-2,-24+bob);
  c.fill();
  // Shaggy right tuft
  c.beginPath();
  c.moveTo(8,-24+bob);
  c.bezierCurveTo(11,-28+bob,9,-32+bob,5,-30+bob);
  c.bezierCurveTo(2,-28+bob,1,-26+bob,2,-24+bob);
  c.fill();
  // Centre cowlick
  c.beginPath();
  c.moveTo(-2,-27+bob);
  c.bezierCurveTo(-1,-32+bob,1,-33+bob,2,-31+bob);
  c.bezierCurveTo(3,-29+bob,2,-27+bob,1,-26+bob);
  c.fill();
  // Big happy eyes
  c.fillStyle="#fff";c.fillRect(-4,-22+bob,4,3);c.fillRect(1,-22+bob,4,3);
  c.fillStyle="#3498db";c.fillRect(-3,-22+bob,3,3);c.fillRect(2,-22+bob,3,3);
  c.fillStyle="#000";c.fillRect(-2,-21+bob,1,2);c.fillRect(3,-21+bob,1,2);
  c.fillStyle="#fff";c.fillRect(-3,-22+bob,1,1);c.fillRect(2,-22+bob,1,1);
  // Big smile
  c.strokeStyle="#c07060";c.lineWidth=1;c.beginPath();c.arc(0,-14+bob,4,0.1*Math.PI,0.9*Math.PI);c.stroke();
  c.restore();
  // Speech bubble
  if(miloMsg&&miloMsgTimer>0){
    var alpha=Math.min(1,miloMsgTimer/10);
    c.save();c.globalAlpha=alpha;
    c.font="bold 9px monospace";
    var tw=c.measureText(miloMsg).width+14;
    var bx=Math.min(Math.max(miloFollowX-tw/2,2),CW-tw-2);
    RR(c,bx,miloFollowY-65,tw,18,4,"rgba(255,248,220,0.96)");
    c.fillStyle="#2a1a3e";c.textAlign="center";
    c.fillText(miloMsg,miloFollowX,miloFollowY-51);c.textAlign="left";
    c.restore();
  }
}

/* Gwyneth follow state — drowsy, drifts behind K'Dee, mumbles in sleep */
var GWYN_QUIPS=["'*snore*'","'...five more minutes...'","'*mumbles*'","'...the unicorns...'","'...MR BUN-BUN...'"];
function updateGwyn(){
  if(!gwynFollowing)return;
  gwynFollowAnim++;
  gwynFollowX+=(kdeeX+30-gwynFollowX)*0.08;
  gwynFollowY+=(kdeeY-gwynFollowY)*0.08;
  if(gwynMsgTimer>0)gwynMsgTimer--;
  if(gwynMsgTimer===0&&Math.random()<0.003){
    gwynMsg=GWYN_QUIPS[Math.floor(Math.random()*GWYN_QUIPS.length)];gwynMsgTimer=110;
  }
}
function drawGwyn(c){
  if(!gwynFollowing)return;
  var bob=Math.sin(gwynFollowAnim*0.15)*1.5;
  var leg=Math.sin(gwynFollowAnim*0.18)*4;
  var sc=1.6;
  c.save();c.translate(gwynFollowX,gwynFollowY);c.scale(sc,sc);
  // Shadow
  c.save();c.globalAlpha=0.1;c.fillStyle="#000";c.beginPath();c.ellipse(0,4,8,3,0,0,Math.PI*2);c.fill();c.restore();
  // Legs
  D(c,-4+leg,0,4,10,"#1a3a7a");D(c,1-leg,0,4,10,"#1a3a7a");
  D(c,-5+leg,9,5,3,"#222");D(c,1-leg,9,5,3,"#222");
  // Body — gradient
  var gbg=c.createLinearGradient(0,-12+bob,0,0+bob);
  gbg.addColorStop(0,"#6080ff");gbg.addColorStop(1,"#2a40b0");
  c.fillStyle=gbg;
  c.beginPath();c.moveTo(-6,-12+bob);c.lineTo(-7,0+bob);c.lineTo(7,0+bob);c.lineTo(6,-12+bob);c.closePath();c.fill();
  // Sleeve cuff
  c.strokeStyle="rgba(100,130,255,0.5)";c.lineWidth=0.7;
  c.beginPath();c.moveTo(-10,-4+bob);c.lineTo(-6,-4+bob);c.stroke();
  c.beginPath();c.moveTo(6,-4+bob);c.lineTo(10,-4+bob);c.stroke();
  // Arms — droopy (sleepy)
  c.fillStyle=P.skin;c.fillRect(-10,-10+bob,4,9);c.fillRect(6,-10+bob,4,9);
  // Head — radial gradient
  var ghg=c.createRadialGradient(-2,-20+bob,2,0,-18+bob,7);
  ghg.addColorStop(0,"#FFD8C8");ghg.addColorStop(1,"#e0a090");
  c.fillStyle=ghg;
  c.beginPath();c.arc(0,-18+bob,7,0,Math.PI*2);c.fill();
  // Hair — bezier flowing blue, soft wave
  c.fillStyle="#3a5fd0";
  c.beginPath();c.arc(0,-18+bob,7,Math.PI,0);c.fill();
  // Left strand with gentle wave
  c.beginPath();
  c.moveTo(-7,-18+bob);
  c.bezierCurveTo(-9,-12+bob,-8,-4+bob,-6,4+bob);
  c.bezierCurveTo(-5,8+bob,-3,9+bob,-2,7+bob);
  c.bezierCurveTo(-3,-2+bob,-4,-12+bob,-3,-18+bob);
  c.fill();
  // Right strand
  c.beginPath();
  c.moveTo(7,-18+bob);
  c.bezierCurveTo(9,-12+bob,8,-4+bob,6,4+bob);
  c.bezierCurveTo(5,8+bob,3,9+bob,2,7+bob);
  c.bezierCurveTo(3,-2+bob,4,-12+bob,3,-18+bob);
  c.fill();
  // Hair highlight
  c.fillStyle="rgba(150,180,255,0.25)";c.beginPath();c.arc(2,-21+bob,3,0,Math.PI*2);c.fill();
  // Closed eyes (sleeping) — slightly thicker for expressiveness
  c.strokeStyle="#445";c.lineWidth=1.2;
  c.beginPath();c.arc(-3,-19+bob,2,Math.PI,0);c.stroke();
  c.beginPath();c.arc(3,-19+bob,2,Math.PI,0);c.stroke();
  // Tiny smile
  c.strokeStyle="#a08090";c.lineWidth=0.9;
  c.beginPath();c.arc(0,-16+bob,2,0,Math.PI);c.stroke();
  c.restore();
  // Speech bubble
  if(gwynMsg&&gwynMsgTimer>0){
    var alpha=Math.min(1,gwynMsgTimer/12);
    c.save();c.globalAlpha=alpha;
    c.fillStyle="rgba(255,255,255,0.92)";c.strokeStyle="#4169E1";c.lineWidth=1;
    RR(c,gwynFollowX-38,gwynFollowY-85,76,22,5,"rgba(255,255,255,0.92)");
    c.strokeRect(gwynFollowX-38,gwynFollowY-85,76,22);
    c.fillStyle="#1a0a2e";c.font="bold 8px monospace";c.textAlign="center";
    c.fillText(gwynMsg,gwynFollowX,gwynFollowY-70);c.textAlign="left";
    c.restore();
  }
}

var walkCheckInterval=null;
function walkTo(tx,ty,cb){
  if(walkCheckInterval){clearInterval(walkCheckInterval);walkCheckInterval=null;}
  kdeeTargetX=Math.max(20,Math.min(340,tx));
  kdeeTargetY=Math.max(480,Math.min(600,ty));
  kdeeWalking=true;
  if(cb){walkCheckInterval=setInterval(function(){if(!kdeeWalking){clearInterval(walkCheckInterval);walkCheckInterval=null;cb();}},50);}
}

/* Draw glowing navigation arrows with labels */
function drawNavArrows(c){
  var hs=hotspots[curRoom]||[];
  var pulse=0.5+0.5*Math.sin(frameTick*0.06);
  hs.forEach(function(h){
    if(!h.open||h.open.indexOf("goto:")!==0)return;
    var cx=h.x+h.w/2,cy=h.y+h.h/2;
    var isLeft=h.x<20,isRight=h.x>320,isTop=h.y<40,isBottom=h.y>580;
    c.save();c.globalAlpha=0.75+0.25*pulse;

    c.font="bold 8px monospace";
    var label=h.name;
    var tw=c.measureText(label).width;

    if(isLeft){
      // Glow strip
      c.fillStyle="rgba(255,215,0,"+0.1*pulse+")";c.fillRect(0,cy-28,22,56);
      // Arrow pointing left
      c.fillStyle=P.gold;c.beginPath();c.moveTo(14,cy-10);c.lineTo(4,cy);c.lineTo(14,cy+10);c.closePath();c.fill();
      // Label pill — inside canvas, to the right of the arrow
      var lx=20,ly=cy-9,lw=tw+10,lh=18;
      RR(c,lx,ly,lw,lh,4,"rgba(0,0,0,0.72)");
      c.fillStyle=P.gold;c.textAlign="left";c.fillText(label,lx+5,ly+13);

    } else if(isRight){
      c.fillStyle="rgba(255,215,0,"+0.1*pulse+")";c.fillRect(338,cy-28,22,56);
      c.fillStyle=P.gold;c.beginPath();c.moveTo(346,cy-10);c.lineTo(356,cy);c.lineTo(346,cy+10);c.closePath();c.fill();
      // Label pill — inside canvas, to the left of the arrow
      var lw=tw+10,lx=336-lw,ly=cy-9,lh=18;
      RR(c,lx,ly,lw,lh,4,"rgba(0,0,0,0.72)");
      c.fillStyle=P.gold;c.textAlign="left";c.fillText(label,lx+5,ly+13);

    } else if(isTop){
      c.fillStyle="rgba(255,215,0,"+0.1*pulse+")";c.fillRect(cx-28,0,56,22);
      c.fillStyle=P.gold;c.beginPath();c.moveTo(cx-10,14);c.lineTo(cx,4);c.lineTo(cx+10,14);c.closePath();c.fill();
      // Label pill below arrow
      var lw=tw+10,lx=Math.min(Math.max(cx-lw/2,2),CW-lw-2),ly=24,lh=16;
      RR(c,lx,ly,lw,lh,4,"rgba(0,0,0,0.72)");
      c.fillStyle=P.gold;c.textAlign="center";c.fillText(label,cx,ly+12);

    } else if(isBottom){
      c.fillStyle="rgba(255,215,0,"+0.1*pulse+")";c.fillRect(cx-28,618,56,22);
      c.fillStyle=P.gold;c.beginPath();c.moveTo(cx-10,626);c.lineTo(cx,636);c.lineTo(cx+10,626);c.closePath();c.fill();
      // Label pill above arrow
      var lw=tw+10,lx=Math.min(Math.max(cx-lw/2,2),CW-lw-2),ly=600,lh=16;
      RR(c,lx,ly,lw,lh,4,"rgba(0,0,0,0.72)");
      c.fillStyle=P.gold;c.textAlign="center";c.fillText(label,cx,ly+12);

    } else {
      // Interior door — archway glow + label above the hotspot (always visible)
      c.fillStyle="rgba(255,215,0,"+0.18*pulse+")";
      c.beginPath();c.arc(cx,h.y+h.h,h.w/2+4,Math.PI,2*Math.PI);
      c.rect(cx-h.w/2-4,h.y+h.h,h.w+8,6);c.fill();
      // Label pill clamped above the door, never below canvas bottom
      var lw=tw+10,lx=Math.min(Math.max(cx-lw/2,2),CW-lw-2);
      var ly=Math.min(h.y+h.h+8,CH-20);
      RR(c,lx,ly,lw,16,4,"rgba(0,0,0,0.72)");
      c.fillStyle=P.gold;c.textAlign="center";c.fillText(label,cx,ly+12);
    }
    c.textAlign="left";
    c.restore();
  });
}

function drawHoverHighlights(c){
  var hs=hotspots[curRoom]||[];
  var pulse=0.5+0.5*Math.sin(frameTick*0.08);
  hs.forEach(function(h){
    if(!h._hover)return;
    // Soft glow outline
    c.save();
    c.shadowColor="rgba(255,215,0,0.6)";c.shadowBlur=8;
    c.strokeStyle="rgba(255,215,0,"+(0.4+0.3*pulse)+")";
    c.lineWidth=2;
    c.beginPath();
    var r=3;var hx=h.x-2,hy=h.y-2,hw=h.w+4,hh=h.h+4;
    c.moveTo(hx+r,hy);c.lineTo(hx+hw-r,hy);c.quadraticCurveTo(hx+hw,hy,hx+hw,hy+r);
    c.lineTo(hx+hw,hy+hh-r);c.quadraticCurveTo(hx+hw,hy+hh,hx+hw-r,hy+hh);
    c.lineTo(hx+r,hy+hh);c.quadraticCurveTo(hx,hy+hh,hx,hy+hh-r);
    c.lineTo(hx,hy+r);c.quadraticCurveTo(hx,hy,hx+r,hy);
    c.closePath();c.stroke();
    c.restore();

    // Tooltip label above object
    if(!isDoor(h)){
      var tx=h.x+h.w/2,ty=h.y-8;
      c.font="bold 8px monospace";
      var tw=c.measureText(h.name).width+8;
      c.fillStyle="rgba(0,0,0,0.7)";
      c.beginPath();
      var bx=tx-tw/2,by=ty-10;
      c.moveTo(bx+2,by);c.lineTo(bx+tw-2,by);c.quadraticCurveTo(bx+tw,by,bx+tw,by+2);
      c.lineTo(bx+tw,by+11);c.quadraticCurveTo(bx+tw,by+13,bx+tw-2,by+13);
      c.lineTo(bx+2,by+13);c.quadraticCurveTo(bx,by+13,bx,by+11);
      c.lineTo(bx,by+2);c.quadraticCurveTo(bx,by,bx+2,by);
      c.closePath();c.fill();
      c.fillStyle=P.gold;c.textAlign="center";c.fillText(h.name,tx,ty-1);c.textAlign="left";
    }
  });
}

/* Vignette overlay for depth */
function drawVignette(c){
  var grd=c.createRadialGradient(CW/2,CH/2,CH*0.25,CW/2,CH/2,CH*0.7);
  grd.addColorStop(0,"rgba(0,0,0,0)");
  grd.addColorStop(1,"rgba(0,0,0,0.35)");
  c.fillStyle=grd;c.fillRect(0,0,CW,CH);
}

/* Ambient particles per room */
var particles=[];
function spawnParticles(roomIdx){
  particles=[];
  var type=null;
  if(roomIdx===8||roomIdx===12)type="dust";      // Attic, Gym
  if(roomIdx===4)type="steam";                     // Bathroom
  if(roomIdx===10)type="sparkle";                  // Jesus Bathroom
  if(roomIdx===11)type="ember";                    // Basement
  if(!type)return;
  for(var i=0;i<18;i++){
    particles.push({x:Math.random()*CW,y:Math.random()*CH*0.6,vx:(Math.random()-0.5)*0.3,vy:-0.2-Math.random()*0.4,life:Math.random()*120+60,maxLife:180,type:type,size:1+Math.random()*2});
  }
}
function drawParticles(c){
  particles.forEach(function(p){
    p.x+=p.vx;p.y+=p.vy;p.life--;
    if(p.life<=0){p.x=Math.random()*CW;p.y=CH*0.6;p.life=p.maxLife;p.vy=-0.2-Math.random()*0.4;}
    var alpha=Math.min(1,p.life/30)*0.4;
    c.save();c.globalAlpha=alpha;
    if(p.type==="dust"){c.fillStyle="#c9a56c";}
    else if(p.type==="steam"){c.fillStyle="#ddeeff";}
    else if(p.type==="sparkle"){c.fillStyle="#FFD700";}
    else if(p.type==="ember"){c.fillStyle="#FF4500";}
    c.beginPath();c.arc(p.x,p.y,p.size,0,Math.PI*2);c.fill();
    c.restore();
  });
}

/* Room transition fade */
var fadeAlpha=0,fadeDir=0,fadeCb=null;
function fadeToRoom(roomIdx){
  fadeDir=1;fadeCb=function(){
    curRoom=roomIdx;
    kdeeX=180;kdeeY=560;kdeeTargetX=180;kdeeTargetY=560;kdeeWalking=false;
    // Always clear Holly state on room change — prevents body lingering
    hollyRunning=false;hollyTrip=false;hollyX=-40;hollyMsg="";hollyMsgTimer=0;
    hollyCatchable=false;hollyStaring=false;hollyStareTimer=0;
    spawnParticles(curRoom);
    updateHUD();setDesc("Entered "+ROOMS[curRoom].name);
    fadeDir=-1;
    // Milo follows but heads to the living room after a few rooms
    if(miloFollowing){
      miloRoomsLeft--;miloFollowX=210;miloFollowY=560;
      if(miloRoomsLeft<=0){
        miloFollowing=false;miloMsg="";miloMsgTimer=0;
        livingRoomKids.milo=true;
        setDesc("Milo headed to the living room to read.");
      }
    }
    // Gwyneth follows drowsily, then collapses on the living room couch
    if(gwynFollowing){
      gwynRoomsLeft--;gwynFollowX=220;gwynFollowY=560;
      if(gwynRoomsLeft<=0){
        gwynFollowing=false;gwynMsg="";gwynMsgTimer=0;
        livingRoomKids.gwyneth=true;
        setDesc("Gwyneth sleepwalked to the couch.");
      }
    }
    checkBattle(roomIdx);
    saveGame();
  };
}

function drawScene(){
  ctx.clearRect(0,0,CW,CH);
  var room=ROOMS[curRoom];
  if(room&&room.bg)room.bg(ctx);
  drawVignette(ctx);
  drawParticles(ctx);
  drawNavArrows(ctx);
  drawKdee(ctx,Math.round(kdeeX),Math.round(kdeeY));
  drawMilo(ctx);
  drawGwyn(ctx);
  drawHolly(ctx);
  drawHoverHighlights(ctx);

  // Tap flash feedback
  if(tapFlash){
    ctx.save();ctx.globalAlpha=tapFlash.t/8*0.5;
    ctx.strokeStyle=P.gold;ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(tapFlash.x,tapFlash.y,12-tapFlash.t,0,Math.PI*2);ctx.stroke();
    ctx.restore();
    tapFlash.t--;if(tapFlash.t<=0)tapFlash=null;
  }

  // Greyson dialog atmospheric overlay
  if(greysonDialogActive)drawGreysonAtmosphere(ctx);
  // Lint monster dialog atmospheric overlay
  if(lintDialogActive)drawLintAtmosphere(ctx);

  ctx.fillStyle="rgba(0,0,0,0.55)";ctx.fillRect(0,0,CW,22);
  ctx.fillStyle=P.gold;ctx.font="bold 10px monospace";ctx.textAlign="center";
  ctx.fillText(room.name,CW/2,15);ctx.textAlign="left";
}

var animRunning=false;
function gameLoop(){if(!animRunning)return;frameTick++;if(battleActive){updateBattle();drawBattle(ctx);}else if(hollyMetaActive){drawHollyMeta(ctx);}else if(sockSortActive){updateSockSort();drawSockSort(ctx);}else if(gwynSneakActive){updateGwynSneak();drawGwynSneak(ctx);}else if(miniActive){updateCatchGame();drawCatchGame(ctx);}else if(frogActive){updateFrogger();drawFrogger(ctx);}else if(racerActive){updateRacer();drawRacer(ctx);}else if(tetActive){updateTetris();drawTetris(ctx);}else if(digActive){updateDig();drawDig(ctx);}else{updateWalk();updateHolly();updateMilo();updateGwyn();drawScene();}
  // Fade overlay runs every frame regardless of active mode
  if(fadeDir!==0){
    fadeAlpha+=fadeDir*0.06;
    if(fadeAlpha>=1){fadeAlpha=1;if(fadeCb){fadeCb();fadeCb=null;}}
    if(fadeAlpha<=0){fadeAlpha=0;fadeDir=0;}
    ctx.fillStyle="rgba(0,0,0,"+fadeAlpha+")";ctx.fillRect(0,0,CW,CH);
  }
  requestAnimationFrame(gameLoop);
}
function startLoop(){if(!animRunning){animRunning=true;gameLoop();}}

function updateHUD(){
  document.getElementById("hk").textContent="\uD83D\uDD11 KEYS: "+keys+"/3";
  document.getElementById("hr").textContent=ROOMS[curRoom].name;
  var m=Math.floor(timer/60),s=timer%60;
  document.getElementById("hs").textContent="\u23F0 "+m+":"+(s<10?"0":"")+s;
  var hpEl=document.getElementById("hhp");
  if(hpEl){
    var hearts="";
    for(var hi=0;hi<kdeeMaxHearts;hi++){
      var q=kdeeHP-hi*4; // quarters remaining for this container
      if(q>=4)hearts+="\u2764\uFE0F";       // full heart
      else if(q===3)hearts+="\uD83D\uDC97"; // almost full (green = 3/4)
      else if(q===2)hearts+="\uD83D\uDC9B"; // half (yellow = 2/4)
      else if(q===1)hearts+="\uD83E\uDDE1"; // sliver (orange = 1/4)
      else hearts+="\uD83E\uDD0D";           // empty (broken)
    }
    hpEl.textContent=hearts;
  }
}

function setDesc(t){document.getElementById("desc-text").textContent=t;}

/* --- PROGRESSIVE INTERACTION DIALOG --- */
/* Click → walk → dialog with LOOK text + verb buttons. Each verb reveals its response. */
var activeHS=null;
var verbColors={use:"#00CED1",take:"#FFD700",talk:"#FF69B4",open:"#FF8C00",push:"#CD5C5C"};

function showInteraction(h){
  activeHS=h;
  lintDialogActive=(h.id==="lint");
  var d=document.getElementById("dlg");
  var inner=document.getElementById("dlg-inner");

  // Set content BEFORE showing overlay so there's no blank-box flash
  setPortraitMode(getPortraitMode(h.id,"look"));
  document.getElementById("dlg-name").textContent=h.name;
  // Pre-clear any running type animation and set initial text immediately
  if(typeTimer){clearInterval(typeTimer);typeTimer=null;}
  var dlgText=document.getElementById("dlg-text");
  dlgText.textContent=h.look||"Hmm... nothing special.";
  buildVerbButtons(h);

  // Now animate the overlay in
  d.classList.remove("on");
  inner.style.animation="none";
  void inner.offsetWidth;
  inner.style.animation="";
  d.classList.add("on");

  // Start typewriter after a short delay so animation starts with text visible
  typeText(dlgText,h.look||"Hmm... nothing special.");
  paused=true;
}

function buildVerbButtons(h){
  var choices=document.getElementById("dlg-choices");
  choices.innerHTML="";
  var verbs=["use","take","talk","open","push"];
  var hasAny=false;
  verbs.forEach(function(v){
    if(!h[v])return;
    if(v==="open"&&h.open&&h.open.indexOf("goto:")===0)return;
    hasAny=true;
    var uid=curRoom+"_"+h.id+"_"+v;
    var btn=document.createElement("div");
    btn.className="dlg-ch";
    btn.setAttribute("data-verb",v);
    var label=verbLabels[v]||v.toUpperCase();
    var color=verbColors[v]||"#FFD700";

    if(usedHS[uid]){
      btn.textContent=label+" \u2713";
      btn.style.opacity="0.35";
      btn.style.borderColor="rgba(255,255,255,0.1)";
      btn.style.color="#888";
    } else {
      btn.textContent=label;
      btn.style.borderColor=color;
      btn.style.color=color;
    }
    btn.addEventListener("click",function(e){
      e.stopPropagation();
      performAction(h,v);
    });
    choices.appendChild(btn);
  });
  // Show continue prompt if no actions available
  document.getElementById("dlg-continue").style.display=hasAny?"none":"";
}

function performAction(h,v){
  var uid=curRoom+"_"+h.id+"_"+v;
  var txt=h[v];
  if(!txt)return;

  // Already done
  if(usedHS[uid]){
    typeText(document.getElementById("dlg-text"),"Already did that.");
    return;
  }

  // Determine the key verb for this hotspot
  var keyVerb=null;
  if(h.hasKey){
    var kv=["push","open","use"];
    for(var i=0;i<kv.length;i++){if(h[kv[i]]){keyVerb=kv[i];break;}}
  }

  // Key discovery
  if(h.hasKey&&v===keyVerb){
    keys++;usedHS[uid]=true;saveGame();
    setPortraitMode("key");
    typeText(document.getElementById("dlg-text"),txt+"\n\n\uD83D\uDD11 KEY FOUND! ("+keys+"/3)");
    buildVerbButtons(h);
    updateHUD();
    if(keys>=3)setTimeout(function(){winGame();},1500);
    return;
  }

  // Quest item pickup (take or push)
  if(h.quest&&(v==="take"||v==="push")){
    inv.push(h.quest);usedHS[uid]=true;
    questItems[h.quest]=true;
    setPortraitMode("excited");
    typeText(document.getElementById("dlg-text"),txt||("Picked up "+h.quest+"!"));
    buildVerbButtons(h);
    updateInv();
    return;
  }

  // Non-quest take (generic collectible)
  if(v==="take"&&!h.quest){
    usedHS[uid]=true;
    var itemName=h.id;
    inv.push(itemName);
    invEmoji[itemName]=invEmoji[itemName]||"\uD83D\uDCE6";
    setPortraitMode("take");
    typeText(document.getElementById("dlg-text"),txt);
    buildVerbButtons(h);
    updateInv();
    return;
  }

  // Mini-game trigger: kitchen cabinets
  if(h.id==="cab"&&v==="open"&&!usedHS[uid]){
    usedHS[uid]=true;
    hideDlg();
    startCatchGame();
    return;
  }

  // Mini-game trigger: backyard BBQ (starts poop frogger)
  if(h.id==="bbq"&&v==="open"&&!usedHS[uid]){
    usedHS[uid]=true;
    hideDlg();
    startFrogger();
    return;
  }

  // Mini-game trigger: hole (starts digging game — repeatable, no usedHS lock)
  if(h.id==="hole"&&(v==="push"||v==="use")){
    hideDlg();
    startDig();
    return;
  }

  // Mini-game trigger: clothes pile (starts Tetris)
  if(h.id==="clothespile"&&(v==="push"||v==="take")&&!usedHS[uid]){
    hideDlg();
    startTetris();
    return;
  }

  // Mini-game trigger: Holly's room door
  if(h.id==="hollyroom"&&v==="open"&&!usedHS[uid]){
    hideDlg();
    startHollyMeta();
    return;
  }

  // Lint monster: use dryer sheet → PURRS, drops lintkey
  if(h.id==="lint"&&v==="use"&&!usedHS[uid]){
    if(inv.indexOf("tidepen")>=0||inv.indexOf("shelf")>=0){
      usedHS[uid]=true;
      inv.push("lintKey");questItems.lintKey=true;
      setPortraitMode("excited");
      typeText(document.getElementById("dlg-text"),"K'Dee holds out the dryer sheet.\n\nThe Lint Monster goes *completely still*.\n\n...then PURRS.\n\nIt dissolves in a slow, satisfied haze.\n\nWhere it sat: a key made entirely of compressed lint.\n\nK'Dee picks it up. It's surprisingly solid.\n\n*lintkey acquired*");
      buildVerbButtons(h);updateInv();
    }else{
      typeText(document.getElementById("dlg-text"),"K'Dee has nothing to use. The Lint Monster watches. It always watches.");
    }
    return;
  }

  // LM2 sockpile: use triggers sock sort minigame
  if(h.id==="sockpile"&&v==="use"&&!usedHS[uid]){
    hideDlg();
    startSockSort();
    return;
  }

  // Gwyneth's room: sneak triggers don't-wake-gwyneth
  if(h.id==="gwyndoor2"&&v==="use"&&!usedHS[uid]){
    hideDlg();
    startGwynSneak();
    return;
  }

  // Regular action
  usedHS[uid]=true;
  // Update portrait reaction to match verb
  var verbMode=getPortraitMode(h.id,v);
  setPortraitMode(verbMode);
  typeText(document.getElementById("dlg-text"),txt);
  buildVerbButtons(h);
}

/* Typewriter text effect */
var typeTimer=null;
function typeText(el,text){
  if(typeTimer){clearInterval(typeTimer);typeTimer=null;}
  el.textContent="";
  var i=0;
  typeTimer=setInterval(function(){
    if(i>=text.length){clearInterval(typeTimer);typeTimer=null;return;}
    el.textContent+=text.charAt(i);
    i++;
  },18);
  // Click to skip
  el._skipHandler=function(){
    if(typeTimer){clearInterval(typeTimer);typeTimer=null;el.textContent=text;}
    el.removeEventListener("click",el._skipHandler);
  };
  el.addEventListener("click",el._skipHandler);
}

function showSimpleDlg(name,text,mode){
  var d=document.getElementById("dlg");
  var inner=document.getElementById("dlg-inner");
  // Set content before showing to prevent blank-box flash
  setPortraitMode(mode||"look");
  document.getElementById("dlg-name").textContent=name;
  document.getElementById("dlg-choices").innerHTML="";
  document.getElementById("dlg-continue").style.display="";
  if(typeTimer){clearInterval(typeTimer);typeTimer=null;}
  var dlgText=document.getElementById("dlg-text");
  dlgText.textContent=text;
  // Now animate overlay in
  d.classList.remove("on");inner.style.animation="none";
  void inner.offsetWidth;inner.style.animation="";d.classList.add("on");
  typeText(dlgText,text);
  paused=true;
}

function hideDlg(){
  if(gameOver)return; // Don't dismiss win/lose dialogs
  if(typeTimer){clearInterval(typeTimer);typeTimer=null;}
  document.getElementById("dlg").classList.remove("on");
  document.getElementById("dlg-continue").style.display="";
  lintDialogActive=false;
  activeHS=null;paused=false;
}

function goToRoom(roomIdx){
  fadeToRoom(roomIdx);
}

function navigateToRoom(h){
  var targetRoom=parseInt(h.open.split(":")[1]);
  var doorX=h.x+h.w/2,doorY=Math.max(480,Math.min(600,h.y+h.h));
  setDesc("Going to "+h.name+"...");
  walkTo(doorX,doorY,function(){goToRoom(targetRoom);});
}

function isDoor(h){return h.open&&h.open.indexOf("goto:")===0;}

/* Click an object → walk to it → show interaction dialog */
function interactWith(h){
  if(isDoor(h)){navigateToRoom(h);return;}
  var hx=h.x+h.w/2,hy=Math.max(480,Math.min(600,h.y+h.h+20));
  setDesc(h.name+"...");
  walkTo(hx,hy,function(){showInteraction(h);});
}

/* --- FULL INVENTORY SYSTEM --- */
var invDetails={
  banana:{emoji:"\uD83C\uDF4C",name:"Banana",desc:"A perfectly ripe banana. Restores 1 heart when eaten.",type:"Food",battle:"Super effective vs. Milo!",heal:4},
  cookie:{emoji:"\uD83C\uDF6A",name:"Snack Cookie",desc:"Confiscated from Greyson's stash. Peanut butter. Restores 2 hearts.",type:"Food",battle:"General battle item",heal:8},
  duck:{emoji:"\uD83E\uDD86",name:"General Quackers",desc:"Leader of the rubber duck army. Seen things. Won't talk about it.",type:"Companion",battle:"Super effective vs. Milo!"},
  bible:{emoji:"\uD83D\uDCD6",name:"Bible",desc:"Proverbs 31. Divine guidance for finding lost keys. (Results may vary.)",type:"Sacred Text",battle:"Super effective vs. Greyson, Space Jesus & Baal'thazar!"},
  flashlight:{emoji:"\uD83D\uDD26",name:"Flashlight",desc:"Found at the workbench. Batteries at 12%. Classic.",type:"Tool",battle:"Useful in battle vs. Forest"},
  necronomicon:{emoji:"\uD83D\uDCDA",name:"Necronomicon",desc:"It whispers. Mostly complaints. Do NOT read aloud at bedtime.",type:"Forbidden Text",battle:"Super effective vs. Greyson, Space Jesus & Baal'thazar!"},
  shovel:{emoji:"\u26CF\uFE0F",name:"Shovel",desc:"From the shed. Good for digging. The cat is suspicious of it.",type:"Tool",battle:"Super effective vs. Baal'thazar!"},
  wrench:{emoji:"\uD83D\uDD27",name:"Wrench",desc:"A sturdy wrench. Opens things that shouldn't be opened.",type:"Tool",battle:"Super effective vs. Daed!"},
  towel:{emoji:"\uD83E\uDDF4",name:"Towel",desc:"Seen better days. Mostly decorative at this point.",type:"Textile",battle:"Super effective vs. Holly & Forest!"},
  book:{emoji:"\uD83D\uDCDA",name:"Parenting Book",desc:"'Parenting Without Losing Your Mind.' Chapter 1: Too late.",type:"Literature",battle:"Super effective vs. Holly!"},
  tidepen:{emoji:"\uD83E\uDDF4",name:"Tide Pen",desc:"For stain emergencies. Which is every day.",type:"Supply",battle:"General battle item"},
  phone:{emoji:"\uD83D\uDCF1",name:"K'Dee's Phone",desc:"Texts from Mom: 'Did you see what Janet did' (no context). 'I need to know about the casserole.' 'I attached a photo' (no photo). Forwarded chain email: IF YOU DON'T SHARE THIS. Battery: 8%. 214 kid photos. One good selfie.",type:"Technology",battle:"Super effective vs. Gwyneth!"},
  bookshelf:{emoji:"\uD83D\uDCDA",name:"Parenting Book",desc:"'Parenting Without Losing Your Mind.' Still on chapter 1.",type:"Literature",battle:"Super effective vs. Holly!"},
  tools:{emoji:"\uD83D\uDD27",name:"Wrench",desc:"Heavy duty. Good for opening stubborn trunks.",type:"Tool",battle:"Super effective vs. Daed!"},
  shelf:{emoji:"\uD83E\uDDF4",name:"Tide Pen",desc:"Almost empty. Story of K'Dee's life.",type:"Supply"},
  flowers:{emoji:"\uD83C\uDF3A",name:"Flowers",desc:"A self-care purchase. Smells like lavender and victory.",type:"Self-Care"},
  drinks:{emoji:"\uD83E\uDD64",name:"Energy Drinks",desc:"Confiscated from Greyson. Three empty cans. Gross.",type:"Contraband",battle:"Useful in battle vs. Greyson"},
  beds:{emoji:"\uD83C\uDF3F",name:"Fresh Herbs",desc:"Rosemary and basil. Tonight's dinner is going to be great.",type:"Ingredient"},
  fthermo:{emoji:"\uD83C\uDF21\uFE0F",name:"Thermometer",desc:"102.3. Poor Forest. Sending healing vibes.",type:"Medical"},
  dumbbells:{emoji:"\uD83C\uDFCB\uFE0F",name:"Dumbbell",desc:"Almost lifted one. Almost.",type:"Equipment"},
  lostSock:{emoji:"\uD83E\uDDE6",name:"Lost Sock",desc:"One sock. Mate unknown. It's been alone a long time.",type:"Textile"},
  lintKey:{emoji:"\uD83D\uDD11",name:"Lint Key",desc:"A key made of compressed lint. Opens... something? Probably nothing.",type:"Odd Item"},
  gnomeNote:{emoji:"\uD83D\uDCDD",name:"Gnome Note",desc:"A note from the gnome: CHECK THE COUCH. In blood. Probably ketchup.",type:"Clue"},
  coin:{emoji:"\uD83E\uDE99",name:"Quarter (2003)",desc:"A 2003 quarter. Found in the pipe drip puddle. It's been down there a while.",type:"Treasure"}
};

// Items that are super-effective somewhere
var battleItems=["banana","duck","bible","necronomicon","wrench","towel","book","phone","flashlight","drinks","shovel","cookie"];

function updateInv(){
  var bc=document.getElementById("bag-count");
  bc.textContent=inv.length>0?inv.length:"";
  var ic=document.getElementById("inv-count");
  if(ic)ic.textContent=inv.length>0?(inv.length+" ITEMS"):"EMPTY";
  // Pulse bag button to draw attention when item added
  var btn=document.getElementById("bagbtn");
  if(btn&&inv.length>0){btn.classList.remove("new-item");void btn.offsetWidth;btn.classList.add("new-item");}
}

function showInv(){
  var screen=document.getElementById("inv-screen");
  screen.classList.add("on");
  var grid=document.getElementById("inv-grid");
  var empty=document.getElementById("inv-empty");
  var detail=document.getElementById("inv-detail");
  grid.innerHTML="";detail.classList.remove("on");
  if(inv.length===0){empty.style.display="block";return;}
  empty.style.display="none";
  inv.forEach(function(it,idx){
    var info=invDetails[it]||{emoji:invEmoji[it]||"\u2753",name:it,desc:"A mysterious item.",type:"???"};
    var cell=document.createElement("div");cell.className="inv-cell";
    if(battleItems.indexOf(it)>=0)cell.classList.add("rarity-battle");
    var inner='<div class="inv-cell-emoji">'+info.emoji+'</div><div class="inv-cell-name">'+info.name+'</div>';
    if(info.battle)inner+='<div class="inv-cell-badge">\u2694</div>';
    cell.innerHTML=inner;
    cell.addEventListener("click",function(){
      var all=grid.querySelectorAll(".inv-cell");
      for(var j=0;j<all.length;j++)all[j].classList.remove("selected");
      cell.classList.add("selected");
      document.getElementById("inv-detail-emoji").textContent=info.emoji;
      document.getElementById("inv-detail-name").textContent=info.name;
      var typeEl=document.getElementById("inv-detail-type");
      if(typeEl)typeEl.textContent=info.type||"";
      document.getElementById("inv-detail-desc").textContent=info.desc;
      var battleEl=document.getElementById("inv-detail-battle");
      if(battleEl){
        if(info.battle){battleEl.textContent="\u2694 "+info.battle;battleEl.classList.add("on");}
        else{battleEl.classList.remove("on");}
      }
      detail.classList.add("on");
      // USE button for food items (only outside battle)
      var existingUse=document.getElementById("inv-use-btn");
      if(existingUse)existingUse.remove();
      if(info.heal&&!battleActive){
        var useBtn=document.createElement("button");
        var heartCount=info.heal/4;
        useBtn.id="inv-use-btn";useBtn.textContent="\uD83C\uDF7D EAT (+"+(heartCount===1?"1 heart":heartCount+" hearts")+")";
        useBtn.style="font-family:monospace;font-size:0.75rem;color:#2ecc71;border:1px solid #2ecc71;background:transparent;padding:8px 20px;border-radius:16px;cursor:pointer;margin-top:8px;letter-spacing:1px;display:block;margin-left:auto;margin-right:auto";
        useBtn.addEventListener("click",function(){
          if(kdeeHP>=kdeeMaxHP){setDesc("K'Dee is already at full health!");return;}
          var healed=Math.min(info.heal,kdeeMaxHP-kdeeHP);
          kdeeHP=Math.min(kdeeMaxHP,kdeeHP+info.heal);
          updateHUD();
          inv.splice(inv.indexOf(it),1);
          var hh=Math.ceil(healed/4);
          setDesc(info.name+" eaten! +"+hh+(hh===1?" heart!":" hearts!"));
          hideInv();
        });
        document.getElementById("inv-detail").appendChild(useBtn);
      }
    });
    grid.appendChild(cell);
  });
}

function hideInv(){document.getElementById("inv-screen").classList.remove("on");}
document.getElementById("bagbtn").addEventListener("click",function(){
  if(document.getElementById("inv-screen").classList.contains("on")){hideInv();}else{showInv();}
});
document.getElementById("inv-close").addEventListener("click",hideInv);

/* --- DIG MINIGAME --- */
/* Tap to dig through layers in the backyard hole. Each layer reveals something. */
var digActive=false,digLayer=0,digProgress=0,digComplete=false;
var digDirt=[],digMsg="",digMsgTimer=0,digResultTimer=0;
var DIG_LAYERS=[
  {name:"TOPSOIL",depth:"6 inches",find:null,color:"#5a3a18",quip:"Just dirt. Good, honest dirt."},
  {name:"WORM ZONE",depth:"1 foot",find:"🪱",color:"#4a2e0e",quip:"A big fat worm. Judging you."},
  {name:"MYSTERY LAYER",depth:"2 feet",find:"🚗",color:"#3a2208",quip:"A toy car! Hot Wheels. From 2008."},
  {name:"OLD ROOTS",depth:"3 feet",find:null,color:"#2a1a04",quip:"Ancient tree roots. Very ominous."},
  {name:"TREASURE?",depth:"4 feet",find:"✨",color:"#1a0e02",quip:"Something sparkly! ...A bottle cap. Still, sparkly."}
];
var DIG_TAPS_PER_LAYER=12;

function startDig(){
  digActive=true;digLayer=0;digProgress=0;digComplete=false;
  digDirt=[];digMsg="TAP TO DIG!";digMsgTimer=60;digResultTimer=0;
  paused=true;
  // Spawn initial dirt particles
  for(var i=0;i<20;i++){
    digDirt.push({x:80+Math.random()*200,y:350+Math.random()*100,vx:(Math.random()-0.5)*3,vy:-(Math.random()*4+1),life:40+Math.random()*30,size:3+Math.random()*4});
  }
}

function digTap(){
  if(!digActive)return;
  if(digComplete){
    // close
    var finalMsg="Something was down there. K'Dee feels accomplished. +1 HP.";
    digActive=false;paused=false;
    kdeeHP=Math.min(kdeeMaxHP,kdeeHP+1);updateHUD();
    showSimpleDlg("THE HOLE",finalMsg,"excited");
    return;
  }
  if(digMsgTimer>0&&digLayer===0&&digProgress===0)digMsgTimer=0;
  digProgress++;
  // Spray some dirt
  for(var i=0;i<6;i++){
    digDirt.push({x:140+Math.random()*80,y:430+Math.random()*40,vx:(Math.random()-0.5)*5,vy:-(Math.random()*6+2),life:30+Math.random()*20,size:2+Math.random()*4});
  }
  if(digProgress>=DIG_TAPS_PER_LAYER){
    var layer=DIG_LAYERS[digLayer];
    digMsg=(layer.find?layer.find+" ":"")+layer.quip;
    digMsgTimer=100;digResultTimer=100;
    digLayer++;
    digProgress=0;
    if(digLayer>=DIG_LAYERS.length){
      digComplete=true;
      digMsg="✨ THE HOLE HAS BEEN CONQUERED.";digMsgTimer=150;
    }
  }
}

function updateDig(){
  if(digMsgTimer>0)digMsgTimer--;
  if(digResultTimer>0)digResultTimer--;
  // Update dirt particles
  for(var i=digDirt.length-1;i>=0;i--){
    var d=digDirt[i];
    d.x+=d.vx;d.y+=d.vy;d.vy+=0.25;d.life--;
    if(d.life<=0)digDirt.splice(i,1);
  }
}

function drawDig(c){
  var CW=360,CH=640;
  // Background — backyard view, darkened
  c.fillStyle="#0a2a0a";c.fillRect(0,0,CW,CH);
  c.fillStyle="#1a4a1a";c.fillRect(0,300,CW,CH-300);
  // Sky strip
  var sg=c.createLinearGradient(0,0,0,300);sg.addColorStop(0,"#1a3a5a");sg.addColorStop(1,"#0a2a0a");
  c.fillStyle=sg;c.fillRect(0,0,CW,300);

  // Header
  c.fillStyle="#8B5E3C";c.font="bold 11px monospace";c.textAlign="center";
  c.fillText("⛏ DIG THE HOLE",CW/2,30);
  c.fillStyle="#aaa";c.font="8px monospace";
  var layerName=digLayer<DIG_LAYERS.length?DIG_LAYERS[digLayer].name:(digComplete?"DONE":"...");
  c.fillText("LAYER "+(digLayer+1)+": "+layerName,CW/2,46);
  c.textAlign="left";

  // Depth cross-section — draw all passed layers + current
  var sectionH=52,sectionTop=60;
  for(var li=0;li<=Math.min(digLayer,DIG_LAYERS.length-1);li++){
    var ly=DIG_LAYERS[li];
    var secY=sectionTop+li*sectionH;
    // Layer fill
    c.fillStyle=ly.color;c.fillRect(80,secY,200,sectionH);
    // Layer top edge crack line
    c.strokeStyle="rgba(255,255,255,0.08)";c.lineWidth=1;
    c.beginPath();c.moveTo(80,secY);c.lineTo(280,secY);c.stroke();
    // Depth label
    c.fillStyle="rgba(255,255,255,0.3)";c.font="6px monospace";c.textAlign="center";
    c.fillText(ly.depth,180,secY+sectionH-6);c.textAlign="left";
    // If this layer was completed and has a find, draw it
    if(li<digLayer&&ly.find){
      c.font="18px monospace";c.textAlign="center";
      c.fillText(ly.find,180,secY+sectionH/2+6);c.textAlign="left";
    }
  }

  // Current layer dig hole — dark oval
  var holeY=sectionTop+Math.min(digLayer,DIG_LAYERS.length-1)*sectionH+sectionH-10;
  c.fillStyle="#0a0a0a";c.beginPath();c.ellipse(180,holeY,40,12,0,0,Math.PI*2);c.fill();
  c.strokeStyle="rgba(255,255,255,0.1)";c.lineWidth=1;c.beginPath();c.ellipse(180,holeY,40,12,0,0,Math.PI*2);c.stroke();

  // Progress bar
  var pbY=sectionTop+(Math.min(digLayer,DIG_LAYERS.length-1)+1)*sectionH+8;
  if(!digComplete){
    c.fillStyle="#222";c.fillRect(80,pbY,200,10);
    var prog=digProgress/DIG_TAPS_PER_LAYER;
    var pbCol=prog>0.7?"#FFD700":prog>0.4?"#FF8C00":"#8B5E3C";
    c.fillStyle=pbCol;c.fillRect(80,pbY,200*prog,10);
    c.strokeStyle="#444";c.lineWidth=1;c.strokeRect(80,pbY,200,10);
    c.fillStyle="#fff";c.font="bold 7px monospace";c.textAlign="center";
    c.fillText("TAP TO DIG  "+Math.floor(prog*100)+"%",180,pbY+8);c.textAlign="left";
  }

  // Dirt particles
  digDirt.forEach(function(d){
    c.save();c.globalAlpha=d.life/60;
    c.fillStyle="#8B5E3C";c.beginPath();c.arc(d.x,d.y,d.size,0,Math.PI*2);c.fill();
    c.restore();
  });

  // Message banner
  if(digMsgTimer>0&&digMsg){
    var ma=Math.min(1,digMsgTimer/20);
    c.save();c.globalAlpha=ma;
    c.fillStyle="rgba(0,0,0,0.7)";
    var tw=c.measureText(digMsg).width+24;
    RR(c,CW/2-tw/2,580,tw,26,4,"rgba(20,10,5,0.9)");
    c.strokeStyle=digComplete?"#FFD700":"#8B5E3C";c.lineWidth=1;c.strokeRect(CW/2-tw/2,580,tw,26);
    c.fillStyle=digComplete?"#FFD700":"#eee";c.font="bold 9px monospace";c.textAlign="center";
    c.fillText(digMsg,CW/2,597);c.textAlign="left";
    c.restore();
  }

  // Tap prompt (pulsing)
  if(!digComplete){
    var pp=0.4+0.3*Math.sin(frameTick*0.12);
    c.fillStyle="rgba(255,255,255,"+pp+")";c.font="bold 9px monospace";c.textAlign="center";
    c.fillText("[ TAP ANYWHERE TO DIG ]",CW/2,620);c.textAlign="left";
  } else {
    var pp2=0.5+0.3*Math.sin(frameTick*0.1);
    c.fillStyle="rgba(255,215,0,"+pp2+")";c.font="bold 9px monospace";c.textAlign="center";
    c.fillText("[ TAP TO FILL IT BACK IN ]",CW/2,620);c.textAlign="left";
  }
}

/* --- FROGGER MINI-GAME --- */
/* Backyard poop dodger: tap/click to hop K'Dee across the yard avoiding dog poop. */
var frogActive=false,frogRow=0,frogCol=3,frogTimer=0,frogLives=3,frogScore=0,frogLevel=1;
var frogPoops=[],frogComplete=false,frogMsgTimer=0,frogMsg="",frogMoveDelay=0;
var FROG_ROWS=7,FROG_COLS=7;// 7x7 grid
var FROG_CELLW=Math.floor(360/FROG_COLS),FROG_CELLH=Math.floor(490/FROG_ROWS);// visible play area
var FROG_TOP=80;// y offset from top of canvas

function startFrogger(){
  frogActive=true;frogRow=FROG_ROWS-1;frogCol=3;frogTimer=0;frogLives=3;frogScore=0;frogLevel=1;
  frogPoops=[];frogComplete=false;frogMsg="DODGE THE POOP!";frogMsgTimer=80;frogMoveDelay=0;
  paused=true;
  spawnFrogPoops();
}

function spawnFrogPoops(){
  frogPoops=[];
  // Each row (except top row = goal, bottom row = start) gets poop obstacles
  // Rows 1..FROG_ROWS-2 are danger rows
  for(var r=1;r<FROG_ROWS-1;r++){
    var count=2+frogLevel+Math.floor(Math.random()*2);
    var dir=(r%2===0)?1:-1;
    var speed=0.3+frogLevel*0.15+Math.random()*0.2;
    for(var i=0;i<count;i++){
      frogPoops.push({
        row:r,
        x:Math.random()*360,
        speed:speed*dir,
        size:frogLevel>=3?16:14
      });
    }
  }
}

function updateFrogger(){
  frogTimer++;
  if(frogMsgTimer>0)frogMsgTimer--;
  if(frogMoveDelay>0)frogMoveDelay--;
  if(frogComplete)return;

  // Move poops horizontally within their row
  frogPoops.forEach(function(p){
    p.x+=p.speed;
    if(p.x<-20)p.x=380;
    if(p.x>380)p.x=-20;
  });

  // Check collision
  if(frogRow>0&&frogRow<FROG_ROWS-1){
    var px=frogCol*FROG_CELLW+FROG_CELLW/2;
    var py=FROG_TOP+frogRow*FROG_CELLH+FROG_CELLH/2;
    frogPoops.forEach(function(p){
      if(p.row!==frogRow)return;
      var dist=Math.abs(p.x-px);
      if(dist<p.size+10){
        frogHit();
      }
    });
  }

  // Win condition: reached top
  if(frogRow===0){
    frogScore+=10+frogLevel*5;
    frogMsg="MADE IT! +"+(10+frogLevel*5)+" pts";frogMsgTimer=80;
    if(frogScore>=50){
      frogComplete=true;
      frogMsg="YOU ESCAPED! K'Dee: "+frogScore+" pts";frogMsgTimer=220;
      // Apply reward: restore 1 full heart
      kdeeHP=Math.min(kdeeMaxHP,kdeeHP+4);updateHUD();
    } else {
      frogLevel++;frogRow=FROG_ROWS-1;frogCol=3;
      spawnFrogPoops();
    }
  }
}

function frogHit(){
  frogLives--;frogRow=FROG_ROWS-1;frogCol=3;
  frogMsg=frogLives>0?"POOP HIT! "+frogLives+" \u2665 left":"GAME OVER!";frogMsgTimer=90;
  if(frogLives<=0){
    frogComplete=true;
    frogMsg="K'Dee slipped. She smells. "+frogScore+" pts";frogMsgTimer=200;
    kdeeHP=Math.max(1,kdeeHP-2);updateHUD(); // -2 quarters (half a heart)
  }
}

function drawFrogger(c){
  // Sky bg
  var bg=c.createLinearGradient(0,0,0,FROG_TOP+FROG_ROWS*FROG_CELLH);
  bg.addColorStop(0,"#87CEEB");bg.addColorStop(1,"#5a8a40");
  c.fillStyle=bg;c.fillRect(0,0,CW,CH);

  // Title bar
  c.fillStyle="rgba(0,0,0,0.7)";c.fillRect(0,0,CW,FROG_TOP);
  c.fillStyle="#fff";c.font="bold 12px monospace";c.textAlign="center";
  c.fillText("POOP DODGER",CW/2,22);c.textAlign="left";
  c.fillStyle="#2ecc71";c.font="10px monospace";c.textAlign="center";
  c.fillText("Score: "+frogScore+"  Lives: "+"\u2665".repeat(Math.max(0,frogLives))+"  Level: "+frogLevel,CW/2,42);c.textAlign="left";

  // Draw grid rows
  for(var r=0;r<FROG_ROWS;r++){
    var ry=FROG_TOP+r*FROG_CELLH;
    var rh=FROG_CELLH;
    if(r===0){
      // Goal: grass patch
      c.fillStyle="#3a7a20";c.fillRect(0,ry,CW,rh);
      c.fillStyle="#FFD700";c.font="bold 10px monospace";c.textAlign="center";
      c.fillText("\u2605 SAFE ZONE \u2605",CW/2,ry+rh/2+4);c.textAlign="left";
    } else if(r===FROG_ROWS-1){
      // Start zone: path
      c.fillStyle="#7a6a50";c.fillRect(0,ry,CW,rh);
    } else {
      // Danger rows: alternate lawn stripes
      c.fillStyle=(r%2===0)?"#4a8a30":"#5a9a38";c.fillRect(0,ry,CW,rh);
      // Row divider
      c.strokeStyle="rgba(0,0,0,0.1)";c.lineWidth=1;c.beginPath();c.moveTo(0,ry);c.lineTo(CW,ry);c.stroke();
    }
  }

  // Draw poop obstacles
  frogPoops.forEach(function(p){
    var py=FROG_TOP+p.row*FROG_CELLH+FROG_CELLH/2;
    c.font=(p.size*1.4)+"px serif";c.textAlign="center";
    c.fillText("\uD83D\uDCA9",p.x,py+p.size/2);
    c.textAlign="left";
  });

  // Draw K'Dee (frog-mode: cute jumping sprite)
  var kx=frogCol*FROG_CELLW+FROG_CELLW/2;
  var ky=FROG_TOP+frogRow*FROG_CELLH+FROG_CELLH/2;
  var bounce=frogMoveDelay>0?-Math.sin(frogMoveDelay/8*Math.PI)*10:0;
  c.save();c.translate(kx,ky+bounce);
  // Mini K'Dee
  c.fillStyle=P.skin;c.beginPath();c.arc(0,-14,7,0,Math.PI*2);c.fill();
  c.fillStyle=P.hair;c.beginPath();c.arc(0,-18,7,Math.PI,2*Math.PI);c.fill();
  c.fillStyle=P.pink;c.fillRect(-7,-10,14,10);// body
  c.fillStyle="#4169E1";c.fillRect(-7,-2,14,5);// legs
  c.fillStyle=P.eye;c.fillRect(-3,-15,2,2);c.fillRect(1,-15,2,2);
  c.restore();

  // Overlay message
  if(frogMsgTimer>0&&frogMsg){
    var alpha=Math.min(1,frogMsgTimer/20);
    c.save();c.globalAlpha=alpha*0.92;
    var tw=c.measureText(frogMsg).width+20;
    c.font="bold 12px monospace";
    RR(c,CW/2-tw/2,CH/2-26,tw,28,6,"rgba(0,0,0,0.85)");
    c.fillStyle="#FFD700";c.textAlign="center";
    c.fillText(frogMsg,CW/2,CH/2-6);c.textAlign="left";
    c.restore();
  }

  // Done overlay
  if(frogComplete&&frogMsgTimer<150){
    c.fillStyle="rgba(0,0,0,0.6)";c.fillRect(0,CH-60,CW,60);
    c.fillStyle="#FFD700";c.font="bold 11px monospace";c.textAlign="center";
    c.fillText("[ TAP TO CONTINUE ]",CW/2,CH-25);c.textAlign="left";
  }

  // Timer progress bar
  var t=frogTimer;
  var barW=((t%300)/300)*CW;
  c.fillStyle="rgba(255,100,100,0.5)";c.fillRect(0,FROG_TOP-6,barW,4);
}

// Frogger input: swipe direction or tap arrows
var frogSwipeStart=null;
canvas.addEventListener("touchstart",function(e){
  if(!frogActive)return;
  var p=getCanvasCoords(e);frogSwipeStart={x:p.x,y:p.y};
},{passive:false});
canvas.addEventListener("touchend",function(e){
  if(!frogActive)return;
  e.preventDefault();
  if(frogComplete){
    var msg=frogLives>0?"K'Dee made it through the poop! She smells like victory. +2 HP!":"K'Dee took a tumble. -2 HP. She's fine. Mostly.";
    frogActive=false;paused=false;
    showSimpleDlg("POOP DODGER",msg,frogLives>0?"excited":"hurt");return;
  }
  if(!frogSwipeStart)return;
  var p=getCanvasCoords(e);
  var dx=p.x-frogSwipeStart.x,dy=p.y-frogSwipeStart.y;
  frogSwipeStart=null;
  frogMove(dx,dy);
},{passive:false});

// Dig minigame touch
canvas.addEventListener("touchstart",function(e){
  if(!digActive)return;
  e.preventDefault();
},{passive:false});
canvas.addEventListener("touchend",function(e){
  if(!digActive)return;
  e.preventDefault();
  digTap();
},{passive:false});

document.addEventListener("keydown",function(e){
  if(!frogActive)return;
  if(e.key==="ArrowUp"||e.key==="w")frogMove(0,-1);
  else if(e.key==="ArrowDown"||e.key==="s")frogMove(0,1);
  else if(e.key==="ArrowLeft"||e.key==="a")frogMove(-1,0);
  else if(e.key==="ArrowRight"||e.key==="d")frogMove(1,0);
  else if(e.key===" "||e.key==="Enter"){
    if(frogComplete){
      var msg=frogLives>0?"K'Dee made it through the poop! She smells like victory. +2 HP!":"K'Dee took a tumble. -2 HP. She's fine. Mostly.";
      frogActive=false;paused=false;
      showSimpleDlg("POOP DODGER",msg,frogLives>0?"excited":"hurt");
    }
  }
});

function frogMove(dx,dy){
  if(frogMoveDelay>0||frogComplete)return;
  if(Math.abs(dx)>Math.abs(dy)){frogCol+=dx>0?1:-1;}else{frogRow+=dy>0?1:-1;}
  frogCol=Math.max(0,Math.min(FROG_COLS-1,frogCol));
  frogRow=Math.max(0,Math.min(FROG_ROWS-1,frogRow));
  frogMoveDelay=10;
}

/* --- CATCH MINI-GAME --- */
/* Kitchen cabinet avalanche: catch falling Tupperware! */
var miniActive=false,miniScore=0,miniTimer=0,miniCatcher=0,miniItems=[],miniMaxTime=360;
var catchEmojis=["\uD83E\uDD63","\uD83C\uDF72","\uD83E\uDD62","\uD83C\uDF5C","\uD83E\uDD64","\uD83C\uDF75","\uD83C\uDF56","\uD83E\uDDC1","\uD83C\uDF6A","\uD83E\uDDC0"];
var catchColors=["#e74c3c","#3498db","#2ecc71","#FFD700","#9b59b6","#FF8C00","#FF69B4","#00CED1","#CD5C5C","#90EE90"];

function startCatchGame(){
  miniActive=true;miniScore=0;miniTimer=0;miniItems=[];miniCatcher=CW/2;
  paused=true;
  // Spawn initial items
  for(var i=0;i<3;i++) spawnCatchItem();
}

function spawnCatchItem(){
  var idx=Math.floor(Math.random()*catchEmojis.length);
  miniItems.push({
    x:30+Math.random()*(CW-60),
    y:-20-Math.random()*60,
    vy:1.5+Math.random()*1.5+miniTimer*0.003,
    emoji:catchEmojis[idx],
    color:catchColors[idx],
    w:24,h:24,
    caught:false,missed:false
  });
}

function drawCatchGame(c){
  // Background
  c.fillStyle="#f5e6d3";c.fillRect(0,0,CW,CH);
  // Cabinets at top
  for(var i=0;i<4;i++){
    D(c,10+i*87,10,78,55,P.dbrown);D(c,14+i*87,14,70,47,P.brown);
    // Open door effect
    D(c,14+i*87,14,70,47,"rgba(0,0,0,0.3)");
  }
  c.fillStyle="#654321";c.font="bold 12px monospace";c.textAlign="center";
  c.fillText("CATCH THE TUPPERWARE!",CW/2,85);
  c.fillStyle="#888";c.font="9px monospace";
  c.fillText("Move mouse/touch to catch",CW/2,100);c.textAlign="left";

  // Score & timer bar
  var timeLeft=Math.max(0,1-miniTimer/miniMaxTime);
  D(c,20,110,CW-40,8,"#333");
  D(c,20,110,Math.floor((CW-40)*timeLeft),8,timeLeft>0.3?"#2ecc71":"#e74c3c");
  c.fillStyle=P.gold;c.font="bold 10px monospace";c.textAlign="center";
  c.fillText("CAUGHT: "+miniScore,CW/2,135);c.textAlign="left";

  // Falling items
  miniItems.forEach(function(item){
    if(item.caught||item.missed)return;
    c.font="20px serif";c.textAlign="center";
    c.fillText(item.emoji,item.x,item.y+20);
    // Shadow
    c.save();c.globalAlpha=0.1;c.fillStyle="#000";
    c.beginPath();c.ellipse(item.x,item.y+28,12,3,0,0,Math.PI*2);c.fill();c.restore();
    c.textAlign="left";
  });

  // Catcher (K'Dee's hands / basket)
  var cy=CH-80;
  // Basket
  c.fillStyle="#8B4513";
  c.beginPath();
  c.moveTo(miniCatcher-28,cy);c.lineTo(miniCatcher-22,cy+24);
  c.lineTo(miniCatcher+22,cy+24);c.lineTo(miniCatcher+28,cy);
  c.closePath();c.fill();
  c.fillStyle="#A0522D";
  c.beginPath();
  c.moveTo(miniCatcher-24,cy+4);c.lineTo(miniCatcher-19,cy+20);
  c.lineTo(miniCatcher+19,cy+20);c.lineTo(miniCatcher+24,cy+4);
  c.closePath();c.fill();
  // Weave lines
  c.strokeStyle="rgba(0,0,0,0.15)";c.lineWidth=1;
  for(var w=-16;w<=16;w+=8){
    c.beginPath();c.moveTo(miniCatcher+w,cy+2);c.lineTo(miniCatcher+w*0.8,cy+22);c.stroke();
  }
  // K'Dee mini
  c.fillStyle=P.skin;c.beginPath();c.arc(miniCatcher,cy-18,8,0,Math.PI*2);c.fill();
  c.fillStyle=P.hair;c.beginPath();c.arc(miniCatcher,cy-23,8,Math.PI,2*Math.PI);c.fill();
  c.fillStyle=P.eye;c.fillRect(miniCatcher-3,cy-19,2,2);c.fillRect(miniCatcher+1,cy-19,2,2);
  D(c,miniCatcher-6,cy-10,12,12,P.pink);

  // Caught flash
  miniItems.forEach(function(item){
    if(item.caught&&item.flash>0){
      c.save();c.globalAlpha=item.flash/10;
      c.fillStyle=P.gold;c.font="bold 14px monospace";c.textAlign="center";
      c.fillText("+1",item.cx,item.cy-10);
      c.textAlign="left";c.restore();
      item.flash--;
    }
  });
}

function updateCatchGame(){
  miniTimer++;
  // Spawn new items
  if(miniTimer%30===0)spawnCatchItem();
  if(miniTimer%60===0&&miniTimer<240)spawnCatchItem(); // extra in second half

  var catchY=CH-80;
  miniItems.forEach(function(item){
    if(item.caught||item.missed)return;
    item.y+=item.vy;
    // Check catch
    if(item.y+20>=catchY&&item.y+20<=catchY+28&&Math.abs(item.x-miniCatcher)<30){
      item.caught=true;item.flash=10;item.cx=item.x;item.cy=catchY;
      miniScore++;
    }
    // Missed
    if(item.y>CH+20)item.missed=true;
  });

  // End
  if(miniTimer>=miniMaxTime){
    miniActive=false;paused=false;
    var msg="";
    if(miniScore>=10)msg="K'Dee caught "+miniScore+" containers! Legendary reflexes! Found a hidden sippy cup too!";
    else if(miniScore>=5)msg="K'Dee caught "+miniScore+" containers! Not bad for 8 AM!";
    else msg="K'Dee caught "+miniScore+" containers. The floor got the rest. Classic Tuesday.";
    showSimpleDlg("AVALANCHE!",msg,"excited");
  }
}

// Mouse/touch control for mini-game
canvas.addEventListener("mousemove",function(e){
  if(!miniActive)return;
  var p=getCanvasCoords(e);
  miniCatcher=Math.max(30,Math.min(CW-30,p.x));
});

function getCanvasCoords(e){
  var r=canvas.getBoundingClientRect();
  var sx=CW/r.width,sy=CH/r.height;
  var cx,cy;
  if(e.touches){cx=e.touches[0].clientX;cy=e.touches[0].clientY;}
  else{cx=e.clientX;cy=e.clientY;}
  return{x:(cx-r.left)*sx,y:(cy-r.top)*sy};
}

/* ===== HOLLY META MINIGAME — "SHE REFUSES" ===== */
var HOLLY_META_ROUNDS=[
  // Round 0-3: All choices lead to ...no.
  {choices:["Hi Holly.","Want to hang out?","Are you okay?","Come to the living room."],response:"...no."},
  {choices:["Hi.","We could watch TV.","I made snacks.","Just for a little while?"],response:"...no."},
  {choices:["I miss you.","Five minutes?","Everyone's there.","Please?"],response:"...no."},
  {choices:["I won't make it weird.","Greyson is being weird instead.","Milo made a fort.","Free snacks."],response:"...no.\n\n(The no is getting quieter, which is somehow worse.)"},
  // Round 4-5: fourth wall breaks
  {choices:["Holly.","Come on.","...","(tap anywhere)"],response:"...why do I have a health bar.\n\nThis is weird. Who made this.\n\n(She looks directly at K'Dee. Then past K'Dee.)"},
  {choices:["(tap anywhere)","(tap anywhere)","(tap anywhere)","(tap anywhere)"],response:"...who designed these controls.\n\nLeft half? Right half? A button that says 'PURSE'?\n\nK'Dee. Something is wrong with this house."},
  // Round 6: single button
  {choices:["Wait—"],response:"...I'm leaving now.\n\nOn my own terms.\n\nWhich is how I do everything."},
  // Round 7: she closes it herself
  {choices:[""],response:""}
];

function startHollyMeta(){
  hollyMetaActive=true;hollyMetaRound=0;paused=true;
}

function hollyMetaAdvance(){
  hollyMetaRound++;
  if(hollyMetaRound>=8){
    // Holly closes the dialog herself — done
    hollyMetaActive=false;paused=false;
    livingRoomKids.holly=true;
    if(kdeeMaxHearts<10){kdeeMaxHearts++;kdeeMaxHP=kdeeMaxHearts*4;kdeeHP=kdeeMaxHP;}
    updateHUD();
    showSimpleDlg("HOLLY","She's right. This is her game too.\n\nHolly goes to the living room.\n\nOn her own terms.\n\nSomehow she's already there when K'Dee gets back.","excited");
  }
}

function drawHollyMeta(c){
  // Dimmed background
  c.fillStyle="rgba(10,10,30,0.88)";c.fillRect(0,0,CW,CH);

  var round=Math.min(hollyMetaRound,7);
  var data=HOLLY_META_ROUNDS[round];

  // Dialog box
  RR(c,15,100,330,420,10,"#1a0a2e");
  c.strokeStyle=P.gold;c.lineWidth=2;c.strokeRect(17,102,326,416);

  // Holly portrait (simple drawn portrait)
  // Face
  var hx=CW/2,hy=175;
  c.fillStyle="#c0a080";c.beginPath();c.arc(hx,hy,38,0,Math.PI*2);c.fill();
  // Hair — dark red
  c.fillStyle="#8B2020";
  c.beginPath();c.arc(hx,hy-20,38,Math.PI,2*Math.PI);c.fill();
  c.fillRect(hx-38,hy-20,76,20);
  // Side hair
  c.fillRect(hx-40,hy-10,12,35);c.fillRect(hx+28,hy-10,12,35);
  // Eyes — one slightly narrowed (perpetually unimpressed)
  c.fillStyle="#333";c.beginPath();c.arc(hx-13,hy,5,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(hx+13,hy,5,0,Math.PI*2);c.fill();
  c.fillStyle="#fff";c.beginPath();c.arc(hx-12,hy-1,2,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(hx+14,hy-1,2,0,Math.PI*2);c.fill();
  // Slight frown
  c.strokeStyle="#7a5030";c.lineWidth=1.5;
  c.beginPath();c.arc(hx,hy+14,8,0.2*Math.PI,0.8*Math.PI);c.stroke();
  // Body hint
  c.fillStyle="#556";c.fillRect(hx-22,hy+38,44,30);

  // Name
  c.fillStyle=P.gold;c.font="bold 13px monospace";c.textAlign="center";
  c.fillText("HOLLY",CW/2,232);c.textAlign="left";

  // Separator
  c.strokeStyle="rgba(255,215,0,0.2)";c.lineWidth=1;
  c.beginPath();c.moveTo(30,240);c.lineTo(330,240);c.stroke();

  if(round===7){
    // Holly closes it herself
    c.fillStyle="#ccc";c.font="10px monospace";c.textAlign="center";
    var closingLines=["","...","...","She reaches for the dialog box.","","She closes it herself.","","[ TAP ]"];
    var lineY=270;
    closingLines.forEach(function(ln){c.fillText(ln,CW/2,lineY);lineY+=22;});
    c.textAlign="left";
    return;
  }

  // Response text
  c.fillStyle="#ddd";c.font="10px monospace";c.textAlign="center";
  var resp=data.response||"";
  var respLines=resp.split("\n");var ry=270;
  respLines.forEach(function(ln){c.fillText(ln,CW/2,ry);ry+=16;});
  c.textAlign="left";

  // Choice buttons (all fake — all do same thing)
  var btnY=380;
  var btnColors=["#4a3060","#3a4060","#3a6040","#604030"];
  if(round>=4){btnColors=["#333","#333","#333","#333"];}
  var choices=data.choices||[];
  for(var i=0;i<Math.min(choices.length,4);i++){
    var bx=30,by=btnY+i*32,bw=300,bh=26;
    if(choices[i]==="")continue;
    RR(c,bx,by,bw,bh,5,btnColors[i]||"#3a3060");
    c.fillStyle="#ddd";c.font="9px monospace";c.textAlign="center";
    c.fillText(choices[i],CW/2,by+17);c.textAlign="left";
  }

  // Tap to continue hint
  var pp=0.3+0.3*Math.sin(frameTick*0.1);
  c.fillStyle="rgba(255,255,255,"+pp+")";c.font="8px monospace";c.textAlign="center";
  c.fillText("[ TAP ANYTHING ]",CW/2,515);c.textAlign="left";
}

/* ===== SOCK SORT MINIGAME ===== */
var sockSortActive=false,sockSortTimer=0,sockSortScore=0;
var sockSortSocks=[],sockSortBaskets=[],sockSortSelected=null;
var SOCK_COLORS=["#e74c3c","#3498db","#eee"];// red, blue, striped
var SOCK_LABELS=["RED","BLUE","STRIPE"];
var SOCK_MAX_TIME=1800;// 30 sec at 60fps

function startSockSort(){
  sockSortActive=true;sockSortTimer=0;sockSortScore=0;paused=true;
  sockSortSelected=null;
  sockSortBaskets=[
    {x:20,y:490,w:80,h:50,color:SOCK_COLORS[0],label:SOCK_LABELS[0]},
    {x:140,y:490,w:80,h:50,color:SOCK_COLORS[1],label:SOCK_LABELS[1]},
    {x:260,y:490,w:80,h:50,color:SOCK_COLORS[2],label:SOCK_LABELS[2]}
  ];
  sockSortSocks=[];
  for(var i=0;i<10;i++){
    var t=Math.floor(Math.random()*3);
    sockSortSocks.push({
      x:30+Math.random()*(CW-60),y:-20-i*55,
      vy:0.8+Math.random()*0.8,type:t,
      color:SOCK_COLORS[t],label:SOCK_LABELS[t],
      sorted:false,w:28,h:20,id:i
    });
  }
}

function updateSockSort(){
  if(!sockSortActive)return;
  sockSortTimer++;
  sockSortSocks.forEach(function(s){
    if(s.sorted)return;
    s.y+=s.vy;
    if(s.y>CH+30)s.y=-20-Math.random()*60;// respawn
  });
  if(sockSortTimer>=SOCK_MAX_TIME){
    sockSortActive=false;paused=false;
    var win=sockSortScore>=6;
    if(win){kdeeHP=Math.min(kdeeMaxHP,kdeeHP+2);updateHUD();}
    showSimpleDlg("SOCK SORT",win?"K'Dee sorted "+sockSortScore+" pairs! She solved the laundry. She is UNSTOPPABLE. +2 HP!":"The socks win. They always win. ("+sockSortScore+"/6 sorted)",win?"excited":"hurt");
  }
}

function drawSockSort(c){
  c.fillStyle="#2a2040";c.fillRect(0,0,CW,CH);
  c.fillStyle="#ddd";c.font="bold 13px monospace";c.textAlign="center";
  c.fillText("SOCK SORT!",CW/2,40);
  // Timer bar
  var tl=Math.max(0,1-sockSortTimer/SOCK_MAX_TIME);
  D(c,20,55,CW-40,8,"#333");
  D(c,20,55,Math.floor((CW-40)*tl),8,tl>0.3?"#2ecc71":"#e74c3c");
  c.fillStyle=P.gold;c.font="10px monospace";
  c.fillText("SORTED: "+sockSortScore+"/6",CW/2,80);c.textAlign="left";
  // Socks
  sockSortSocks.forEach(function(s){
    if(s.sorted)return;
    var sel=sockSortSelected&&sockSortSelected.id===s.id;
    c.save();
    if(sel){c.shadowColor="#fff";c.shadowBlur=10;}
    // Sock shape: body + cuff
    c.fillStyle=s.color;
    c.beginPath();c.ellipse(s.x+14,s.y+12,13,8,0,0,Math.PI*2);c.fill();
    c.fillRect(s.x+2,s.y+4,24,12);
    if(s.type===2){// striped
      c.fillStyle="rgba(0,0,0,0.25)";
      for(var si=0;si<3;si++)c.fillRect(s.x+4+si*8,s.y+4,4,12);
    }
    // Cuff
    c.fillStyle="rgba(255,255,255,0.2)";c.fillRect(s.x+2,s.y+4,24,5);
    if(sel){c.shadowBlur=0;}
    c.restore();
  });
  // Baskets
  sockSortBaskets.forEach(function(b){
    RR(c,b.x,b.y,b.w,b.h,5,b.color);
    c.fillStyle="rgba(0,0,0,0.3)";c.font="bold 8px monospace";c.textAlign="center";
    c.fillText(b.label,b.x+b.w/2,b.y+28);c.textAlign="left";
  });
  // Selection hint
  if(!sockSortSelected){
    c.fillStyle="rgba(255,255,255,0.4)";c.font="8px monospace";c.textAlign="center";
    c.fillText("TAP a sock then TAP a basket",CW/2,460);c.textAlign="left";
  }else{
    c.fillStyle="#FFD700";c.font="8px monospace";c.textAlign="center";
    c.fillText("Now TAP the matching basket!",CW/2,460);c.textAlign="left";
  }
}

function sockSortClick(mx,my){
  if(!sockSortActive)return;
  // If a sock is selected, check basket click
  if(sockSortSelected){
    for(var i=0;i<sockSortBaskets.length;i++){
      var b=sockSortBaskets[i];
      if(mx>=b.x&&mx<=b.x+b.w&&my>=b.y&&my<=b.y+b.h){
        if(b.label===sockSortSelected.label){
          sockSortSelected.sorted=true;sockSortScore++;
          if(sockSortScore>=6){sockSortTimer=SOCK_MAX_TIME;} // instant win check
        }
        sockSortSelected=null;return;
      }
    }
    // Clicked somewhere else — deselect
    sockSortSelected=null;
    return;
  }
  // Select a sock
  for(var i=0;i<sockSortSocks.length;i++){
    var s=sockSortSocks[i];
    if(s.sorted)continue;
    if(mx>=s.x&&mx<=s.x+s.w&&my>=s.y&&my<=s.y+s.h+4){
      sockSortSelected=s;return;
    }
  }
}

function sockSortClick(mx,my){
  if(!sockSortActive)return;
  // If a sock is selected, check basket click
  if(sockSortSelected){
    for(var i=0;i<sockSortBaskets.length;i++){
      var b=sockSortBaskets[i];
      if(mx>=b.x&&mx<=b.x+b.w&&my>=b.y&&my<=b.y+b.h){
        if(b.label===sockSortSelected.label){
          sockSortSelected.sorted=true;sockSortScore++;
          if(sockSortScore>=6){sockSortTimer=SOCK_MAX_TIME;} // instant win check
        }
        sockSortSelected=null;return;
      }
    }
    // Clicked somewhere else — deselect
    sockSortSelected=null;
    return;
  }
  // Select a sock
  for(var i=0;i<sockSortSocks.length;i++){
    var s=sockSortSocks[i];
    if(s.sorted)continue;
    if(mx>=s.x&&mx<=s.x+s.w&&my>=s.y&&my<=s.y+s.h+4){
      sockSortSelected=s;return;
    }
  }
}

/* ===== DON'T WAKE GWYNETH MINIGAME ===== */
var gwynSneakActive=false,gwynSneakX=30,gwynSneakLives=3,gwynSneakCrossings=0;
var gwynSneakObstacles=[],gwynSneakMsg="",gwynSneakMsgTimer=0,gwynSneakDone=false;
var GWYN_GOAL_X=330,GWYN_START_X=30;

function startGwynSneak(){
  gwynSneakActive=true;paused=true;
  gwynSneakX=GWYN_START_X;gwynSneakLives=3;gwynSneakCrossings=0;
  gwynSneakDone=false;gwynSneakMsg="Shhhh...";gwynSneakMsgTimer=80;
  spawnGwynObstacles();
}

function spawnGwynObstacles(){
  gwynSneakObstacles=[];
  var count=3+gwynSneakCrossings;
  for(var i=0;i<count;i++){
    var dir=i%2===0?1:-1;
    gwynSneakObstacles.push({
      x:Math.random()*300+30,
      y:280+Math.floor(Math.random()*3)*55,
      vx:(0.6+Math.random()*0.8+gwynSneakCrossings*0.2)*dir,
      w:28,h:22,
      type:i%3// 0=toy, 1=book, 2=Z float
    });
  }
}

function updateGwynSneak(){
  if(!gwynSneakActive||gwynSneakDone)return;
  if(gwynSneakMsgTimer>0)gwynSneakMsgTimer--;
  // Move obstacles
  gwynSneakObstacles.forEach(function(o){
    o.x+=o.vx;
    if(o.x<10)o.x=10;
    if(o.x>CW-40)o.x=CW-40;
    if(o.x<=10||o.x>=CW-40)o.vx*=-1;
  });
  // Collision check
  gwynSneakObstacles.forEach(function(o){
    if(Math.abs(gwynSneakX-o.x-o.w/2)<18&&Math.abs(320-o.y-o.h/2)<20){
      gwynSneakLives--;
      gwynSneakX=GWYN_START_X;
      var wakeQuips=["'...hm?'","'...mom?'","'...is someone there?'","'...five more minutes...'"];
      gwynSneakMsg=wakeQuips[Math.floor(Math.random()*wakeQuips.length)];gwynSneakMsgTimer=90;
      if(gwynSneakLives<=0){
        gwynSneakDone=true;
        gwynSneakMsg="Gwyneth wakes up. 'MOM. IT IS 3AM.'";gwynSneakMsgTimer=180;
      }
    }
  });
}

function gwynSneakClick(mx,my){
  if(!gwynSneakActive)return;
  if(gwynSneakDone){
    gwynSneakActive=false;paused=false;
    var won=gwynSneakCrossings>=3;
    if(won){if(kdeeMaxHearts<10){kdeeMaxHearts++;kdeeMaxHP=kdeeMaxHearts*4;kdeeHP=kdeeMaxHP;}updateHUD();}
    showSimpleDlg("DON'T WAKE GWYNETH",won?"K'Dee made it through THREE TIMES. Gwyneth sleeps on. +1 heart container!":"K'Dee knocked everything over. Gwyneth is now extremely awake. K'Dee retreats.","excited");
    return;
  }
  // Click right half = move right, left half = move left
  var step=28;
  if(mx>CW/2)gwynSneakX=Math.min(GWYN_GOAL_X,gwynSneakX+step);
  else gwynSneakX=Math.max(GWYN_START_X,gwynSneakX-step);
  // Check if reached goal
  if(gwynSneakX>=GWYN_GOAL_X){
    gwynSneakCrossings++;
    gwynSneakX=GWYN_START_X;
    spawnGwynObstacles();
    if(gwynSneakCrossings>=3){
      gwynSneakDone=true;
      gwynSneakMsg="YOU MADE IT! 3/3 \u2665";gwynSneakMsgTimer=150;
    }else{
      gwynSneakMsg="Shhh... "+(3-gwynSneakCrossings)+" more...";gwynSneakMsgTimer=80;
    }
  }
}

function drawGwynSneak(c){
  // Blue starry background (Gwyneth's room)
  c.fillStyle="#1a2a4a";c.fillRect(0,0,CW,CH);
  // Stars (fairy lights)
  for(var i=0;i<20;i++){
    var sx=(i*73)%360,sy=(i*41)%100+10;
    c.fillStyle="rgba(100,200,255,"+(0.4+Math.sin(frameTick*0.08+i)*0.3)+")";
    c.beginPath();c.arc(sx,sy,1.5,0,Math.PI*2);c.fill();
  }
  // Title
  c.fillStyle="#87CEEB";c.font="bold 12px monospace";c.textAlign="center";
  c.fillText("DON'T WAKE GWYNETH",CW/2,40);
  // Lives & crossings
  c.fillStyle=P.gold;c.font="10px monospace";
  c.fillText("\u2665\u2665\u2665".substring(0,(gwynSneakLives*2))+"  "+gwynSneakCrossings+"/3",CW/2,60);
  c.textAlign="left";
  // Gwyneth sleeping in bed
  RR(c,60,200,200,60,8,"#3a5a8a");// bed
  c.fillStyle="#4a7ab0";c.fillRect(60,206,200,48);// blanket
  // Gwyneth's head
  c.fillStyle="#c0a080";c.beginPath();c.arc(130,200,16,0,Math.PI*2);c.fill();
  c.fillStyle="#5c3a1e";c.beginPath();c.arc(130,192,16,Math.PI,2*Math.PI);c.fill();
  c.fillRect(114,192,32,12);
  // Closed eyes (sleeping)
  c.strokeStyle="#333";c.lineWidth=1.5;
  c.beginPath();c.arc(123,199,4,Math.PI,2*Math.PI);c.stroke();
  c.beginPath();c.arc(137,199,4,Math.PI,2*Math.PI);c.stroke();
  // Z floats
  for(var z=0;z<3;z++){
    var zx=155+(z*18),zy=175-z*18-Math.sin(frameTick*0.05+z)*5;
    var za=(frameTick*0.02+z)*0.8%1;
    c.fillStyle="rgba(135,206,235,"+(0.3+za*0.4)+")";
    c.font="bold "+(10+z*3)+"px monospace";c.textAlign="center";
    c.fillText("z",zx,zy);c.textAlign="left";
  }
  // Obstacles
  var obsEmoji=["🧸","📚","✨"];
  gwynSneakObstacles.forEach(function(o){
    c.font="20px serif";c.textAlign="center";
    c.fillText(obsEmoji[o.type]||"🧸",o.x+o.w/2,o.y+o.h);
    c.textAlign="left";
  });
  // K'Dee sneaking figure (simplified)
  var ky=320;
  c.fillStyle=P.skin;c.beginPath();c.arc(gwynSneakX,ky-22,7,0,Math.PI*2);c.fill();
  c.fillStyle=P.hair;c.beginPath();c.arc(gwynSneakX,ky-27,7,Math.PI,2*Math.PI);c.fill();
  c.fillStyle=P.pink;c.fillRect(gwynSneakX-6,ky-15,12,12);
  c.fillStyle="#4169E1";c.fillRect(gwynSneakX-4,ky-4,4,8);c.fillRect(gwynSneakX,ky-4,4,8);
  // Tip-toe indicator (finger to lips)
  c.fillStyle="rgba(255,255,255,0.6)";c.font="12px serif";c.textAlign="center";
  c.fillText("🤫",gwynSneakX,ky-34);c.textAlign="left";
  // Goal arrow
  c.fillStyle="#0f0";c.font="bold 10px monospace";c.textAlign="center";
  c.fillText("→ GOAL",320,330);c.textAlign="left";
  // Message
  if(gwynSneakMsgTimer>0){
    c.fillStyle="rgba(255,255,255,0.9)";c.font="bold 10px monospace";c.textAlign="center";
    c.fillText(gwynSneakMsg,CW/2,390);c.textAlign="left";
  }
  // Controls hint
  c.fillStyle="rgba(255,255,255,0.3)";c.font="8px monospace";c.textAlign="center";
  c.fillText("TAP LEFT to move left  |  TAP RIGHT to move right",CW/2,620);c.textAlign="left";
  if(gwynSneakDone){
    var pp=0.4+0.3*Math.sin(frameTick*0.1);
    c.fillStyle="rgba(255,255,255,"+pp+")";c.font="bold 10px monospace";c.textAlign="center";
    c.fillText("[ TAP TO CONTINUE ]",CW/2,460);c.textAlign="left";
  }
}

function findHS(mx,my){
  var hs=hotspots[curRoom]||[];
  for(var i=hs.length-1;i>=0;i--){var h=hs[i];if(isDoor(h))continue;if(mx>=h.x&&mx<=h.x+h.w&&my>=h.y&&my<=h.y+h.h)return h;}
  for(var i=hs.length-1;i>=0;i--){
    var h=hs[i];if(!isDoor(h))continue;
    var ex=h.x,ey=h.y,ew=h.w,eh=h.h;
    if(h.x<20){ex=0;ew=Math.max(h.w,40);}
    if(h.x>300){ex=Math.min(h.x,320);ew=360-ex;}
    if(h.y<40){ey=0;eh=Math.max(h.h,50);}
    if(h.y+h.h>600){eh=640-h.y;}
    if(mx>=ex&&mx<=ex+ew&&my>=ey&&my<=ey+eh)return h;
  }
  return null;
}

canvas.addEventListener("click",function(e){
  if(paused&&!battleActive){paused=false;document.getElementById("pausebtn").textContent="⏸";setDesc("What should K'Dee do?");return;}
  if(battleActive){var p=getCanvasCoords(e);battleClick(p.x,p.y);return;}
  // Holly meta minigame: any click advances round
  if(hollyMetaActive){hollyMetaAdvance();return;}
  // Sock sort: click to select/place socks
  if(sockSortActive){var p=getCanvasCoords(e);sockSortClick(p.x,p.y);return;}
  // Gwyn sneak: click to move K'Dee
  if(gwynSneakActive){var p=getCanvasCoords(e);gwynSneakClick(p.x,p.y);return;}
  // Dig minigame: any tap digs
  if(digActive){digTap();return;}
  // Frogger: click left/right half to move
  if(frogActive){
    if(frogComplete){
      var msg=frogLives>0?"K'Dee made it through the poop! She smells like victory. +2 HP!":"K'Dee took a tumble. -2 HP. She's fine. Mostly.";
      frogActive=false;paused=false;
      showSimpleDlg("POOP DODGER",msg,frogLives>0?"excited":"hurt");return;
    }
    var p=getCanvasCoords(e);
    if(p.x<CW/2)frogMove(-1,0);else frogMove(1,0);
    return;
  }
  // Racer: click left/right half to lane change
  if(racerActive){
    var p=getCanvasCoords(e);
    if(p.x<CW/2)racerLaneMoveBy(-1);else racerLaneMoveBy(1);
    return;
  }
  // Tetris: click left half = move left, right half = move right
  if(tetActive){
    if(tetOver||tetWon){tetEndGame();return;}
    var p=getCanvasCoords(e);
    if(p.x<CW/2)tetMoveH(-1);else tetMoveH(1);
    return;
  }
  if(paused||gameOver)return;
  var p=getCanvasCoords(e);
  // Check if player clicked on running Holly
  if(hollyRunning&&hollyCatchable&&!hollyTrip){
    var hsc=1.4*30; // approximate catch radius
    if(Math.abs(p.x-hollyX)<hsc&&Math.abs(p.y-hollyY)<hsc){
      hollyTrip=true;hollyTripTimer=60;hollyCatchable=false;
      hollyMsg="";hollyMsgTimer=0;
      hollyWasTripped=true;livingRoomKids.holly=true;
      return;
    }
  }
  var h=findHS(p.x,p.y);
  if(h){interactWith(h);}else{walkTo(p.x,p.y);setDesc("Nothing interesting there.");}
});

/* Touch: long-press shows tooltip, short tap interacts */
var touchTimer=null,touchStart=null,tapFlash=null;
canvas.addEventListener("touchstart",function(e){
  e.preventDefault();
  if(battleActive){var p=getCanvasCoords(e);battleClick(p.x,p.y);return;}
  if(miniActive){var p=getCanvasCoords(e);miniCatcher=Math.max(30,Math.min(CW-30,p.x));return;}
  if(paused||gameOver)return;
  var p=getCanvasCoords(e);
  touchStart={x:p.x,y:p.y,time:Date.now()};
  // Long-press: after 300ms show tooltip
  touchTimer=setTimeout(function(){
    var h=findHS(p.x,p.y);
    if(h){
      // Set hover for visual feedback
      var hs=hotspots[curRoom]||[];hs.forEach(function(hh){hh._hover=false;});
      h._hover=true;
      if(isDoor(h)){setDesc("\u25B6 Go to "+h.name);}else{setDesc("\uD83D\uDC41 "+h.name);}
      // Clear after 1.5s
      setTimeout(function(){h._hover=false;setDesc("What should K'Dee do?");},1500);
    }
    touchTimer=null;touchStart=null;
  },300);
},{passive:false});
canvas.addEventListener("touchmove",function(e){
  if(miniActive){e.preventDefault();var t=e.touches[0];var r=canvas.getBoundingClientRect();miniCatcher=Math.max(30,Math.min(CW-30,(t.clientX-r.left)*(CW/r.width)));}
},{passive:false});
canvas.addEventListener("touchend",function(e){
  if(!touchStart)return;
  var elapsed=Date.now()-touchStart.time;
  if(touchTimer){clearTimeout(touchTimer);touchTimer=null;}
  if(elapsed<300&&!paused&&!gameOver){
    // Short tap: interact
    var p=touchStart;
    var h=findHS(p.x,p.y);
    // Tap flash
    tapFlash={x:p.x,y:p.y,t:8};
    // Check Holly tap
    if(hollyRunning&&hollyCatchable&&!hollyTrip){
      var hsc=1.4*30;
      if(Math.abs(p.x-hollyX)<hsc&&Math.abs(p.y-hollyY)<hsc){
        hollyTrip=true;hollyTripTimer=60;hollyCatchable=false;hollyMsg="";hollyMsgTimer=0;
        hollyWasTripped=true;livingRoomKids.holly=true;
        touchStart=null;return;
      }
    }
    if(h){interactWith(h);}else{walkTo(p.x,p.y);setDesc("Nothing interesting there.");}
  }
  touchStart=null;
},{passive:false});

canvas.addEventListener("mousemove",function(e){
  if(miniActive||battleActive)return; // handled by other listeners
  var p=getCanvasCoords(e);var hs=hotspots[curRoom]||[];var found=null;
  hs.forEach(function(h){h._hover=false;if(p.x>=h.x&&p.x<=h.x+h.w&&p.y>=h.y&&p.y<=h.y+h.h){found=h;h._hover=true;}});
  if(found){if(isDoor(found)){setDesc("\u25B6 Go to "+found.name);}else{setDesc("\uD83D\uDC41 "+found.name);}canvas.style.cursor="pointer";}
  else{setDesc("What should K'Dee do?");canvas.style.cursor="crosshair";}
});

document.getElementById("dlg-continue").addEventListener("click",hideDlg);
document.getElementById("dlg").addEventListener("click",function(e){if(e.target===document.getElementById("dlg")||e.target===document.getElementById("dlg-inner"))hideDlg();});

/* --- TURN-BASED BATTLE SYSTEM v2 --- */
/* Cinematic VS splash, attack animations, floating damage, unique character sprites */
var battleActive=false,battleDone={},battleState=null;
var dmgFloats=[];// {x,y,txt,color,life}

var FIGHTERS={
  milo:{
    name:"MILO",title:"THE SOCIAL READER",hp:8,maxHp:8,color:"#3498db",
    hair:"#654321",hairStyle:"shaggy",skin:P.skin,shirt:"#3498db",pants:"#4169E1",short:true,
    idleQuips:["*tugs K'Dee's shirt*","'Mom can you read to me?'","*holds up book dramatically*","'Guess what chapter I'm on!'"],
    attacks:[
      {name:"BOOK REPORT",dmg:0,quips:["Milo gives a full plot summary. All 312 pages.","'So in CHAPTER ONE the main character—' It's a saga.","'The book is SO GOOD and you have to hear all of it RIGHT NOW.'","Milo describes every character's feelings. In detail.","'And THEN, this is the BEST PART—' K'Dee's soul leaves her body.","He reads the dedication page aloud. With emotion.","Milo recites page 47 from memory. Word for word."]},
      {name:"SHOW DRAWING",dmg:1,quips:["Milo shows a drawing. 'It's you!' It's a blob.","'LOOK WHAT I MADE!' It's actually beautiful.","The drawing is... a dinosaur reading keys? Art.","He has drawn forty-seven dinosaurs. All named.","'This one is you. This is dad. These are the keys.'","'It's abstract.' It is many colors. Very sincerely made."]},
      {name:"HUG LEGS",dmg:1,quips:["Milo bear-hugs K'Dee's legs. She's rooted!","*CLAMP* Milo is now a leg accessory.","'I love you THIS much!' Legs: immobilized.","He refuses to let go until K'Dee hugs back. Stubborn. Effective.","Milo deploys the Full Koala. K'Dee cannot walk."]},
      {name:"BUT MOM",dmg:2,quips:["'But MOOOOOM.' Critical emotional damage!","Milo deploys the puppy eyes. It's super effective!","'But you PROMISED to read with me.' K'Dee feels guilt.","'BUT MOM READ WITH ME.' Three words. Maximum devastation.","The puppy eyes have UPGRADED. K'Dee cannot function.","'Just FIVE more minutes, mom.' It has been 45 minutes.","'But MOOOOM you never LISTEN.' She is listening. She is dying."]}
    ],
    intro:["Milo blocks the doorway with a stack of books.","'MOM! Mom. Mom. Mommy. MOMMM!'","He has something VERY important to share.","It's book-related. Obviously."],
    defeat:["Milo finishes his book summary.","'OK bye mom!' He sprints away with three books.","...blissful silence. Brief. Very brief."],
    itemEffects:{
      banana:{dmg:5,msg:["K'Dee hands Milo the banana.","His eyes go WIDE. 'FOR ME?!'","He peels it and runs off, narrating his banana adventure."],super:true},
      duck:{dmg:6,msg:["K'Dee deploys General Quackers.","Milo GASPS. 'A DUCK!'","He immediately starts a duck army campaign. Battle over."],super:true},
      phone:{dmg:3,msg:["K'Dee shows Milo a game on her phone.","He's hypnotized. Blessed silence."]}
    }
  },
  holly:{
    name:"HOLLY",title:"THE TALL SHADOW",hp:10,maxHp:10,color:"#DDA0DD",
    hair:"#654321",hairStyle:"long",skin:P.skin,shirt:"#DDA0DD",pants:"#8B668B",tall:true,
    idleQuips:["*appears silently behind K'Dee*","*has been standing there for a while*","*blinks slowly*","'...hi.'"],
    attacks:[
      {name:"SILENT APPEAR",dmg:3,quips:["Holly was just... there. She didn't walk over. She was THERE.","K'Dee turns around and Holly is six inches away. How long has she been there?!","Holly materializes from the hallway shadow. Scary-quiet for someone so tall.","She steps out from behind a door she did not just come through. UNSETTLING."]},
      {name:"LONG ARM REACH",dmg:2,quips:["Holly's arms are distractingly long. She reaches something K'Dee thought was safe.","The wingspan is REAL. K'Dee did not account for the wingspan.","Holly stretches and knocks something off a shelf three feet away. From here. Without moving."]},
      {name:"HOVER",dmg:1,quips:["Holly hovers just behind K'Dee's shoulder without saying anything.","She is SO tall she just... looms. Politely. It's very unnerving.","'...do you need help.' It is not a question. It is a fact that Holly will help."]},
      {name:"GENTLE GRIP",dmg:2,quips:["Holly holds K'Dee's wrist very gently. She is stronger than she looks.","The hug is soft. K'Dee is somehow immobilized anyway.","Holly wraps one arm around K'Dee's shoulders and just... doesn't let go. Very calm."]}
    ],
    intro:["K'Dee turns around.","Holly is already there.","She has been there for a while, apparently.","'...hi mom.'","She is very tall."],
    defeat:["Holly gives one slow, solemn nod.","'...okay.'","She drifts silently back down the hall.","K'Dee checks to make sure she's gone. She is. Somehow."],
    itemEffects:{
      towel:{dmg:5,msg:["K'Dee throws the towel.","Holly catches it with one hand without blinking.","'...thank you.' She folds it neatly. Battle confusion reigns."],super:true},
      book:{dmg:4,msg:["K'Dee reads aloud from the parenting book.","Holly sits cross-legged on the floor immediately.","She is TOO TALL for this to work. It works anyway."],super:true}
    }
  },
  greyson:{
    name:"GREYSON",title:"THE FRONTIER SCIENTIST",hp:12,maxHp:12,color:"#e67e22",
    hair:"#8B6914",hairStyle:"dark",moustache:true,skin:P.skin,shirt:"#c9a56c",pants:"#3d2b1f",
    idleQuips:["*strokes moustache thoughtfully*","*adjusts imaginary sheriff badge*","*squints at you like a horizon*","'Yep.'"],
    attacks:[
      {name:"SCIENCE FACT",dmg:1,quips:["'Did you know the average human spends 6 months looking for lost items?' K'Dee's eye twitches.","Greyson recites the chemical formula for stress. It does not help.","'According to my research—' K'Dee cannot take more research.","He holds up a flask. It bubbles ominously. 'It's fine.'"]},
      {name:"MARSHAL STARE",dmg:2,quips:["Greyson gives the thousand-yard western squint. Unsettling.","'I'm gonna need you to calm down, partner.' K'Dee is not calm.","He tilts his hat brim with one finger. Maximum drama. Somehow it works.","The stare says: I have seen things on Mars you wouldn't believe."]},
      {name:"MARTIAN LOGIC",dmg:2,quips:["'On Mars there are no keys because no one has pockets.' K'Dee stares.","'Have you considered relocating to a planet with fewer doors?'","He draws a diagram. It is a map of Mars with Texas borders on it.","'Mars colonists won't have this problem.' GREYSON."]},
      {name:"LASSO THEORY",dmg:1,quips:["Greyson mimes throwing a lasso. Somehow K'Dee trips.","'In the old west, you lost your horse, you walked.' 'GREYSON.'","He narrates the encounter like a nature documentary. K'Dee loses the will to argue."]}
    ],
    intro:["Greyson is at his chemistry set, cowboy hat on.","\u2605 A wanted poster of an alien hangs on the wall.","'Oh hey mom.'","'Greyson I need my keys.'","'Yep. Reckon they're around here somewhere.'"],
    defeat:["Greyson pushes back his hat and nods slowly.","'Respect the hustle, ma.'","'Saw somethin' key-shaped near the garage. Scientifically speaking.'","He turns back to his telescope. Aimed at Mars. Obviously."],
    itemEffects:{
      necronomicon:{dmg:6,msg:["K'Dee holds up the Necronomicon.","Greyson's eyes go wide as saucers.","'IS THAT EXTRATERRESTRIAL IN ORIGIN?!'","He grabs it, starts cross-referencing with his Mars notes. Battle over."],super:true},
      bible:{dmg:5,msg:["'Have you considered... faith over science?'","Greyson.exe has encountered a paradox.","He sits in silence. First time in years."],super:true},
      shovel:{dmg:3,msg:["K'Dee raises the shovel.","'That's regulation frontier equipment, ma.'","'Exactly.' K'Dee is done with this."]}
    }
  },
  gwyneth:{
    name:"GWYNETH",title:"THE STYLISH NARCOLEPTIC",hp:6,maxHp:6,color:P.sky,
    hair:"#4169E1",hairStyle:"long",skin:P.skin,shirt:"#4169E1",pants:"#1a3a7a",narcolepsy:true,
    idleQuips:["*zzzzzzz*","*snore*","*mumbles about unicorns*","*sleep-smiles*","*sleep-laughs at something*","*mumbles 'five more minutes'*","*curls tighter*","*snore intensifies*"],
    attacks:[
      {name:"*SNORE*",dmg:0,quips:["Gwyneth snores. Somehow this is still stressful.","The snoring intensifies. K'Dee can't focus.","She snores so loud the room vibrates.","The snoring has RHYTHM now. K'Dee is hypnotized.","SNORING. PROFESSIONAL GRADE. K'Dee cannot concentrate."]},
      {name:"SLEEP TALK",dmg:1,quips:["'The unicorns... need more glitter...'","'No, MR. BUN-BUN, that's MY tiara...'","'Five more minutes...' She's been saying that for 2 hours.","'*mumble* ...the PRINCESS needs her KEYS...' Wait, what?","'...they're under... the...zzzz.' SO CLOSE.","'I WON'T eat the marshmallows— wait, yes I will...'","She talks in full sentences. None of them useful.","'Mom... mom you left your... zzzzz.' GWYNETH."]},
      {name:"ROLL OVER",dmg:2,quips:["Gwyneth rolls over and lands ON K'Dee's foot.","*THUD* She rolls like a sleepy bowling ball.","She unconsciously rolls toward K'Dee. Homing nap.","*WHAM* Gwyneth rolls with unexpected force. K'Dee's shins.","The roll is PERFECT. Unconscious technique. Devastating."]},
      {name:"*zzzzz*",dmg:0,quips:["Gwyneth sleeps HARDER. This is honestly impressive.","She achieves a new level of sleep. Transcendent.","The sleeping is aggressive somehow.","She is now sleeping in 4 dimensions.","Somehow the SLEEP ITSELF is an attack.","She is at maximum nap. This is her final form."]}
    ],
    intro:["Gwyneth is lying face-down on the floor.","'Gwyneth? ...Gwyneth?'","*magnificent snoring*","Oh. Narcolepsy nap. Classic Gwyneth."],
    defeat:["Gwyneth wakes up suddenly.","'Oh hi mom! Was I asleep?'","'For the whole battle.' 'What battle?'","'...never mind. Love you, baby.'"],
    itemEffects:{
      phone:{dmg:6,msg:["K'Dee plays an alarm at MAX VOLUME.","Gwyneth LEVITATES off the ground.","'I'M UP! I'M UP! WHAT YEAR IS IT?!'"],super:true},
      banana:{dmg:3,msg:["K'Dee waves banana near Gwyneth's nose.","*sniff sniff* Her eyes flutter.","'Is that... a banana?' Still mostly asleep."]}
    }
  },
  forest:{
    name:"FOREST",title:"DO NOT DISTURB",hp:5,maxHp:5,color:"#556b2f",
    hair:"#F0E68C",hairStyle:"shock",beard:"#c0392b",skin:P.skin,shirt:"#1a1a2e",pants:"#333",
    idleQuips:["*typing intensifies*","*does not look up*","*headphones stay on*","*snack wrapper crinkle*"],
    attacks:[
      {name:"IGNORE",dmg:1,quips:["Forest ignores K'Dee so hard it physically hurts.","*no response* K'Dee is invisible apparently.","He tabs back to his game mid-sentence. K'Dee is defeated.","Maximum ignore. Expert level. Years of practice."]},
      {name:"MUTE",dmg:1,quips:["Forest mutes his mic. AND K'Dee. Somehow.","*headphones on* Your words cannot reach him now.","He puts on noise-canceling headphones. Total blackout."]},
      {name:"WALL OF SILENCE",dmg:2,quips:["The silence is DEAFENING. K'Dee can't think.","He hasn't spoken in 6 hours. This is normal for him.","The quiet is a weapon. Forest has mastered it.","*complete stillness* K'Dee checks if he's breathing. He is."]},
      {name:"SNACK THROW",dmg:2,quips:["An empty energy drink can flies across the room!","SNACK BARRAGE! Empty wrappers everywhere! K'Dee takes snack damage!","He throws Goldfish crackers with alarming precision!","*FLING* A bag of chips hits K'Dee directly. Full bag. Ow."]}
    ],
    intro:["K'Dee opens the door to the bubble den.","Signs: GO AWAY. LOADING. DO NOT DISTURB.","Forest sits inside his gaming dome. Headphones on.","*typing* *not looking up*","'Forest. FOREST.'","*one AirPod removed*","'...what.'"],
    defeat:["Forest removes both headphones. Shocking.","'Did you check the kitchen counter?'","'I saw them like... yesterday maybe.'","*headphones back on* He's gone again."],
    itemEffects:{
      towel:{dmg:4,msg:["K'Dee drapes the towel over Forest's monitor.","'HEY—' He can't see the screen!","'OKAY OKAY I'll help!' Screen dependency: confirmed."],super:true},
      flashlight:{dmg:3,msg:["K'Dee shines the flashlight into the gaming dome.","'THE BRIGHTNESS! MY EYES AREN'T CALIBRATED FOR THIS!'","He covers his screen. Chaos in the den."]},
      bible:{dmg:2,msg:["K'Dee reads healing prayers.","Forest looks up briefly.","'...was that from Proverbs?' Close enough."]}
    }
  },
  daed:{
    name:"DAED",title:"THE ESCAPE ARTIST",hp:1,maxHp:1,color:"#cc0000",
    hair:"#654321",hairStyle:"mullet",truckerHat:true,oily:true,skin:P.skin,shirt:"#555",pants:"#333",
    idleQuips:["*looks at door*","*jingles car keys*","'Well, I should—'","*edges toward exit*"],
    attacks:[
      {name:"ESCAPE!",dmg:0,quips:["Daed is already halfway out the door!","'Gotta check on the Corvette!' *ZOOM*","He moves faster than K'Dee has ever seen him move.","Daed activates dad-escape velocity."]}
    ],
    intro:["Daed appears, covered in car oil.","His mullet flows majestically.","'Oh HIIIIII Mom, I was just—'","'DAED. My keys.'","'Keys? What keys? Gotta go!'"],
    defeat:["Daed vanishes in a cloud of motor oil.","'GOTTA GO! CORVETTE NEEDS ME!'","*door slams* *engine revs* *tires screech*","Classic. Daed."],
    itemEffects:{
      wrench:{dmg:2,msg:["K'Dee brandishes the wrench.","'IS. THIS. YOURS.'","Daed sweats through the oil. Impressive.","'I can explain—' *POOF* He's gone."],super:true}
    }
  },
  demon:{
    name:"BAAL'THAZAR",title:"DEMON OF MILD INCONVENIENCE",hp:16,maxHp:16,color:"#8B0000",
    hair:"#1a0000",hairStyle:"horns",skin:"#c0392b",shirt:"#1a0000",pants:"#0a0000",demon:true,
    idleQuips:["*tail flicks menacingly*","'I have PAPERWORK for you.'","*brimstone smell intensifies*","'Your warranty is expired.'"],
    attacks:[
      {name:"INFERNAL SHRIEK",dmg:2,quips:["BAAL'THAZAR unleashes a bone-rattling shriek! K'Dee's ears ring!","A demonic wail shakes the basement walls! Critical earworm damage!","The shriek contains a catchy jingle. K'Dee can't get it out of her head.","SHRIEK! The pentagram glows. K'Dee is momentarily deaf AND annoyed."]},
      {name:"SOUL CONTRACT",dmg:1,quips:["'Sign HERE.' K'Dee doesn't have her reading glasses. Trap?","A contract materializes. Fine print: infinite. K'Dee is legally confused.","'It's just a standard soul waiver.' It is not standard.","He produces a clipboard. FROM WHERE. K'Dee is disturbed."]},
      {name:"BRIMSTONE BREATH",dmg:3,quips:["BRIMSTONE BREATH! It smells like sulfur AND burnt coffee!","A scorching blast of brimstone! K'Dee's hair frizzes!","'My breath is NOT that bad—' IT IS THAT BAD. K'Dee takes full damage.","The breath hits like a wall. K'Dee considers a breath mint arsenal."]},
      {name:"MILD CURSE",dmg:1,quips:["Baal'thazar curses K'Dee with slightly sticky keys forever.","'May your socks always be slightly damp.' K'Dee is horrified.","A mild hex. K'Dee will stub her toe later. Guaranteed.","Cursed! K'Dee's next grocery run will have one broken cart wheel."]},
      {name:"SUMMON PAPERWORK",dmg:2,quips:["Mountains of bureaucratic hellfire paperwork bury K'Dee!","'Have you filed Form 666-B?' K'Dee has NOT.","An avalanche of infernal paperwork! In TRIPLICATE!","The IRS has NOTHING on this. K'Dee takes critical paperwork damage."]}
    ],
    intro:["K'Dee descends into the basement.","The pentagram glows an angry red.","Candles flare. A shape rises from the shadows.","He's... shorter than expected.","'AT LAST! A MORTAL STANDS BEFORE—'","'Are you the one who keeps moving my Tupperware?'","A long pause.","'...I AM BAAL'THAZAR, DEMON OF MILD—'","'BAAL'THAZAR! MY TUPPERWARE.'","'IT IS AN OFFERING. TECHNICALLY.'"],
    defeat:["Baal'thazar staggers.","'Impossible. My HR rating is EXCELLENT.'","The pentagram flickers and goes dark.","'Fine. Your Tupperware is in the upstairs cabinet.'","'You KNEW where it was this WHOLE TIME?!'","'...goodbye, K'Dee.' He dissolves into sulfur smoke.","The basement smells like burnt toast for a week."],
    itemEffects:{
      necronomicon:{dmg:7,msg:["K'Dee opens the Necronomicon.","Baal'thazar FREEZES.","'Where did you GET that?!'","'The basement.' 'THAT'S MY PROPERTY!'","He's contractually bound to flee. Maximum chaos."],super:true},
      bible:{dmg:6,msg:["K'Dee produces the Bible.","Baal'thazar recoils with theatrical flair.","'NOT THE BOOK! NOT THE BOOOOK!'","He retreats dramatically into the pentagram.","Holy damage: CRITICAL."],super:true},
      shovel:{dmg:4,msg:["K'Dee raises the shovel.","'YOU DUG THE HOLE IN THE BACKYARD!'","Baal'thazar sweats. 'That was... the DOG.'","'THE DOG DOESN'T HAVE OPPOSABLE THUMBS, BAAL'THAZAR.'"],super:true},
      flashlight:{dmg:3,msg:["K'Dee shines the flashlight directly at Baal'thazar.","'AH! MY EYES! SO BRIGHT!'","Demons hate flashlights. Apparently.","He shields his glowing eyes. K'Dee has the advantage."]}
    }
  },
  jesus:{
    name:"SPACE JESUS",title:"LORD OF THE BATHROOM",hp:14,maxHp:14,color:"#FFD700",
    hair:"#8B6914",hairStyle:"long",skin:"#FDBCB4",shirt:"#f0f0f0",pants:"#ddd",halo:true,
    idleQuips:["*radiates warm golden light*","'Bless this mess.'","*looks knowingly at pinup painting*","'Peace be with you, K'Dee.'"],
    attacks:[
      {name:"HOLY LIGHT",dmg:2,quips:["BLINDING RADIANCE! K'Dee can't look directly at him!","Warm holy light floods the bathroom. K'Dee is momentarily stunned.","A golden beam hits K'Dee square in the soul.","Space Jesus glows intensely. K'Dee squints. Critical soul damage!"]},
      {name:"BLESS THE CHAOS",dmg:1,quips:["'This too shall pass, K'Dee.' She somehow feels worse.","Space Jesus blesses the entire house. The chaos doubles.","A divine benediction. The LEGO hurts even more now.","'Have you tried praying about the keys?' It does not help."]},
      {name:"WALK ON WATER",dmg:2,quips:["Space Jesus walks across the golden tub. K'Dee is humbled.","He walks on the holy water. K'Dee slips watching. Ouch.","'Watch this.' He walks on water. K'Dee watches, forgets to dodge."]},
      {name:"DEVIL REMATCH",dmg:3,quips:["Space Jesus flexes, remembering his battle with the devil. POWER SURGES!","He gestures at the Space Jesus vs Devil painting above. Intimidation +100.","'I beat the devil. You're next, K'Dee.' The bathroom trembles.","Space Jesus channels his devil-fighting energy! Maximum holy damage!"]}
    ],
    intro:["K'Dee enters the Jesus Bathroom.","The golden toilet gleams. Candles flicker.","Space Jesus steps out of the painting on the wall.","His halo crackles. The pinup girl waves from her frame.","'K'Dee. You dare disturb my sacred bathroom?'","'I just need my keys, Jesus.'","'...PROVE YOUR WORTH.'"],
    defeat:["Space Jesus nods slowly.","'Your mom energy... it is strong.'","The pinup girl claps from her painting.","'The keys are wherever you left them, obviously.'","'...thanks, Jesus.'","He winks. Returns to the painting.","The bathroom smells like frankincense."],
    itemEffects:{
      bible:{dmg:6,msg:["K'Dee holds up the Bible.","Space Jesus GASPS.","'You... actually READ it?!'","His halo short-circuits.","'Fair enough. You win this round.'"],super:true},
      necronomicon:{dmg:5,msg:["K'Dee opens the Necronomicon.","Space Jesus recoils! 'NOT THE DARK TEXTS!'","'Put that AWAY!' He covers his halo.","Maximum divine discomfort!"],super:true},
      duck:{dmg:3,msg:["K'Dee holds up General Quackers.","'I MADE DUCKS, you know.'","Space Jesus pauses, smiling fondly.","'...OK, that one's cute.'"]}
    }
  }
};

var battleRoomMap={3:"milo",5:"daed",10:"jesus",11:"demon",20:"gwyneth",21:"forest"};
var gwynBattle=false;

/* ── GREYSON ATMOSPHERE ───────────────────────────────────────────
   Draws over Greyson's room while his dialog is active:
   amber/orange chemistry-lab glow, bubbling flask particles,
   a faint star-map on the wall, western-star motifs.
*/
function drawGreysonAtmosphere(c){
  var t=frameTick;
  c.save();
  // Warm amber overlay tinting the whole scene
  c.globalAlpha=0.18+0.04*Math.sin(t*0.03);
  var grad=c.createRadialGradient(220,340,20,220,340,200);
  grad.addColorStop(0,"#FF8C00");grad.addColorStop(0.6,"#cc5500");grad.addColorStop(1,"transparent");
  c.fillStyle=grad;c.fillRect(0,0,CW,CH);
  c.restore();

  // Flask glow — three chemistry flasks sitting on Greyson's desk (right side mid-room)
  var flasks=[{x:252,y:355,col:"#FF8C00"},{x:268,y:348,col:"#ffcc00"},{x:284,y:352,col:"#FF4500"}];
  flasks.forEach(function(fl,i){
    var pulse=0.5+0.5*Math.sin(t*0.07+i*1.1);
    c.save();c.globalAlpha=0.25*pulse;
    var fg=c.createRadialGradient(fl.x,fl.y,2,fl.x,fl.y,22);
    fg.addColorStop(0,fl.col);fg.addColorStop(1,"transparent");
    c.fillStyle=fg;c.beginPath();c.arc(fl.x,fl.y,22,0,Math.PI*2);c.fill();
    c.restore();
  });

  // Bubble particles rising from flasks
  c.save();
  for(var i=0;i<6;i++){
    var bph=(t*0.8+i*47)%200;
    var bx=flasks[i%3].x+Math.sin(bph*0.12)*4;
    var by=flasks[i%3].y-bph*0.4;
    if(by>flasks[i%3].y-80){
      c.globalAlpha=0.45*(1-bph/200);
      c.fillStyle=["#FF8C00","#ffcc00","#FF4500"][i%3];
      c.beginPath();c.arc(bx,by,1.5,0,Math.PI*2);c.fill();
    }
  }
  c.restore();

  // Faint star constellation on the back wall (left side, upper area)
  var stars2=[[60,90],[72,78],[50,72],[80,100],[65,115],[44,105],[55,62]];
  c.save();c.globalAlpha=0.22+0.08*Math.sin(t*0.02);
  c.strokeStyle="#FFD700";c.lineWidth=0.6;
  var edges=[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[2,6]];
  edges.forEach(function(e){
    c.beginPath();c.moveTo(stars2[e[0]][0],stars2[e[0]][1]);c.lineTo(stars2[e[1]][0],stars2[e[1]][1]);c.stroke();
  });
  stars2.forEach(function(s){
    c.fillStyle="#FFD700";c.beginPath();c.arc(s[0],s[1],1.3,0,Math.PI*2);c.fill();
  });
  c.restore();

  // Western sheriff star badge glint (top-right area, like on his hat shelf)
  c.save();
  var gAlpha=0.28+0.18*Math.abs(Math.sin(t*0.04));
  c.globalAlpha=gAlpha;c.fillStyle="#FFD700";
  var sx=300,sy=130,sr=7;
  for(var pt=0;pt<5;pt++){
    var ang=-Math.PI/2+(pt*4*Math.PI/5);
    var ang2=ang+2*Math.PI/10;
    c.beginPath();
    c.moveTo(sx+sr*Math.cos(ang),sy+sr*Math.sin(ang));
    c.lineTo(sx+sr*0.4*Math.cos(ang2),sy+sr*0.4*Math.sin(ang2));
    if(pt===4)c.closePath();
    else{
      ang=ang+(4*Math.PI/5);
      c.lineTo(sx+sr*Math.cos(ang),sy+sr*Math.sin(ang));
    }
  }
  // simpler: draw 5-point star with lines
  c.beginPath();
  for(var p=0;p<5;p++){
    var a0=-Math.PI/2+p*4*Math.PI/5;
    var a1=a0+2*Math.PI/10;
    if(p===0)c.moveTo(sx+sr*Math.cos(a0),sy+sr*Math.sin(a0));
    else c.lineTo(sx+sr*Math.cos(a0),sy+sr*Math.sin(a0));
    c.lineTo(sx+sr*0.38*Math.cos(a1),sy+sr*0.38*Math.sin(a1));
  }
  c.closePath();c.fill();
  c.restore();
}

/* ── LINT ATMOSPHERE ──────────────────────────────────────────────
   Draws over LM3 while the lint monster dialog is active:
   pulsing sickly green glow from the monster's position,
   floating lint motes drifting upward, ethereal glowing eyes.
*/
function drawLintAtmosphere(c){
  var t=frameTick;
  c.save();
  // Sickly green-grey pulsing radial glow where the lint monster sits (LM3 center-left)
  var mx=130,my=430;
  var pulse=0.5+0.5*Math.sin(t*0.05);
  c.globalAlpha=(0.18+0.12*pulse);
  var mg=c.createRadialGradient(mx,my,8,mx,my,140);
  mg.addColorStop(0,"#88ff44");mg.addColorStop(0.4,"#336600");mg.addColorStop(1,"transparent");
  c.fillStyle=mg;c.fillRect(0,0,CW,CH);
  c.restore();

  // Floating lint motes
  c.save();
  for(var i=0;i<12;i++){
    var mph=(t*0.5+i*53)%320;
    var lx=mx-60+((i*37)%120)+(Math.sin(t*0.04+i)*8);
    var ly=my+30-mph*0.5;
    if(ly>my-130){
      c.globalAlpha=0.5*(1-mph/320);
      c.fillStyle=i%3===0?"#aaddaa":i%3===1?"#88bb88":"#ccddcc";
      c.beginPath();c.arc(lx,ly,1.2+Math.sin(t*0.06+i)*0.6,0,Math.PI*2);c.fill();
    }
  }
  c.restore();

  // Pair of glowing eyes hovering in the lint mass (follow monster position)
  var eyePulse=0.7+0.3*Math.sin(t*0.08);
  c.save();c.globalAlpha=0.65*eyePulse;
  // Left eye glow
  var lg=c.createRadialGradient(mx-10,my-12,1,mx-10,my-12,8);
  lg.addColorStop(0,"#ffffff");lg.addColorStop(0.3,"#88ff44");lg.addColorStop(1,"transparent");
  c.fillStyle=lg;c.beginPath();c.arc(mx-10,my-12,8,0,Math.PI*2);c.fill();
  // Right eye glow
  var rg=c.createRadialGradient(mx+10,my-12,1,mx+10,my-12,8);
  rg.addColorStop(0,"#ffffff");rg.addColorStop(0.3,"#88ff44");rg.addColorStop(1,"transparent");
  c.fillStyle=rg;c.beginPath();c.arc(mx+10,my-12,8,0,Math.PI*2);c.fill();
  // Pupil dots
  c.globalAlpha=eyePulse;c.fillStyle="#000";
  c.beginPath();c.arc(mx-10,my-12,2.5,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(mx+10,my-12,2.5,0,Math.PI*2);c.fill();
  c.restore();

  // Yarn tendril wisps drifting outward
  c.save();c.globalAlpha=0.20+0.10*Math.sin(t*0.03);
  c.strokeStyle="#66aa44";c.lineWidth=1;
  for(var j=0;j<4;j++){
    var ta=j*Math.PI/2+t*0.01;
    c.beginPath();c.moveTo(mx,my);
    c.quadraticCurveTo(mx+Math.cos(ta)*30,my+Math.sin(ta)*20,mx+Math.cos(ta)*55,my+Math.sin(ta)*38);
    c.stroke();
  }
  c.restore();
}

function checkBattle(roomIdx){
  var fid=battleRoomMap[roomIdx];
  if(!fid||battleDone[fid])return;
  if(roomIdx===19){setTimeout(function(){startGreysonDialog();},600);return;}
  setTimeout(function(){startBattle(fid);},600);
}

function startGreysonDialog(){
  if(battleDone["greyson"])return;
  greysonDialogActive=true;
  setPortraitMode("default");
  var d=document.getElementById("dlg");var inner=document.getElementById("dlg-inner");
  d.classList.remove("on");inner.style.animation="none";void inner.offsetWidth;inner.style.animation="";d.classList.add("on");
  document.getElementById("dlg-name").textContent="GREYSON";
  document.getElementById("dlg-text").textContent="Greyson is deep in thought at his chemistry set. He tilts his hat without looking up.\n\n'Hey mom. You look... statistically stressed.'";
  var choices=document.getElementById("dlg-choices");
  choices.innerHTML=
    '<div class="dlg-ch" id="gd-keys">🔑 Have you seen my keys?</div>'+
    '<div class="dlg-ch" id="gd-science">🧪 What are you working on?</div>'+
    '<div class="dlg-ch" id="gd-mars">🔴 Tell me about Mars.</div>'+
    '<div class="dlg-ch" id="gd-leave">🚪 Never mind.</div>';
  document.getElementById("dlg-continue").style.display="none";
  document.getElementById("gd-keys").addEventListener("click",function(){
    document.getElementById("dlg-text").textContent="'Keys...' He strokes his moustache. 'Based on historical data and my own field research — garage. Near the Corvette. Scientifically speaking.'\n\n'GREYSON.'\n\n'I said scientifically.'";
    choices.innerHTML='<div class="dlg-ch" id="gd-thanks">Thanks, Greyson.</div><div class="dlg-ch" id="gd-hug-keys">🤗 Hug him.</div>';
    document.getElementById("gd-thanks").addEventListener("click",function(){greysonDialogActive=false;hideDlg();battleDone["greyson"]=true;});
    document.getElementById("gd-hug-keys").addEventListener("click",function(){greysonHug();});
  });
  document.getElementById("gd-science").addEventListener("click",function(){
    document.getElementById("dlg-text").textContent="His eyes light up. He gestures at three bubbling flasks.\n\n'A compound that theoretically accelerates sock-finding. Currently also turns things orange. Unrelated.'\n\nHe holds up his hand. It is orange.";
    choices.innerHTML='<div class="dlg-ch" id="gd-back">...okay then.</div>';
    document.getElementById("gd-back").addEventListener("click",function(){startGreysonDialog();});
  });
  document.getElementById("gd-mars").addEventListener("click",function(){
    document.getElementById("dlg-text").textContent="He slowly swivels his chair to face you fully. He removes his hat.\n\n'...I thought you'd never ask.'\n\nFifteen minutes later. You know more about Mars than NASA. You feel changed.\n\n'Anyway. Garage. Keys. Go.'";
    choices.innerHTML='<div class="dlg-ch" id="gd-done">I need a moment.</div><div class="dlg-ch" id="gd-hug-mars">🤗 Hug him.</div>';
    document.getElementById("gd-done").addEventListener("click",function(){greysonDialogActive=false;hideDlg();battleDone["greyson"]=true;});
    document.getElementById("gd-hug-mars").addEventListener("click",function(){greysonHug();});
  });
  document.getElementById("gd-leave").addEventListener("click",function(){greysonDialogActive=false;hideDlg();battleDone["greyson"]=true;});
}

function greysonHug(){
  var d=document.getElementById("dlg");var inner=document.getElementById("dlg-inner");
  d.classList.remove("on");inner.style.animation="none";void inner.offsetWidth;inner.style.animation="";d.classList.add("on");
  document.getElementById("dlg-name").textContent="GREYSON";
  document.getElementById("dlg-text").textContent="K'Dee hugs him.\n\nGreyson goes completely rigid.\n\nFive full seconds of silence.\n\nHis hat tips 2 degrees. Maximum emotion.\n\n'...statistically speaking, that was... acceptable.'\n\nHe picks up a book and heads downstairs.";
  var choices=document.getElementById("dlg-choices");
  choices.innerHTML='<div class="dlg-ch" id="gd-hug-done">❤️ Love you, kid.</div>';
  document.getElementById("dlg-continue").style.display="none";
  document.getElementById("gd-hug-done").addEventListener("click",function(){
    greysonDialogActive=false;hideDlg();battleDone["greyson"]=true;livingRoomKids.greyson=true;
    if(kdeeMaxHearts<10)kdeeMaxHearts++;
    kdeeMaxHP=kdeeMaxHearts*4;kdeeHP=kdeeMaxHP;
    updateHUD();
    setDesc("Greyson headed to the living room. +1 \u2764\uFE0F");
  });
}

function startBattle(fighterId){
  var f=FIGHTERS[fighterId];if(!f)return;
  battleActive=true;paused=true;dmgFloats=[];
  battleState={
    id:fighterId,fighter:f,enemyHP:f.hp,
    turnCount:0,shakeTimer:0,shakeX:0,
    flashTimer:0,flashColor:"",
    kdeeAnim:0,enemyAnim:0,
    phase:"vsIntro",vsTimer:150,// VS splash (extended for cinematic)
    introLine:0,introTimer:0,
    msg:"",msgLines:[],
    kdeePose:"idle",kdeeActionTimer:0,
    enemyPose:"idle",enemyActionTimer:0,
    quipIdx:0
  };
}

function rPick(arr){return arr[Math.floor(Math.random()*arr.length)];}

/* ===== PORTRAIT ANIMATION SYSTEM =====
   Draws animated K'Dee in the dialog portrait canvas with reaction-specific expressions.
   Reactions: look, use, take, talk, open, push, key, spooky, food, sacred, hurt, excited
*/
var portraitCanvas=null,portraitCtx=null,portraitAnim=null,portraitMode="look",portraitTick=0;

// Per-hotspot category → reaction mode
var HOTSPOT_REACTIONS={
  // Food / tasty items
  banana:"food",fridge:"food",sink:"curious",stove:"use",
  // Spooky / forbidden
  necronomicon:"spooky",penta:"spooky",skull:"spooky",crystal:"spooky",
  // Sacred
  jcross:"sacred",jport:"sacred",jbible:"sacred",jbattle:"sacred",jpinup:"sacred",jtub:"sacred",
  // Keys
  plant:"excited",couch:"excited",car:"excited",nightstand:"excited",
  // Picking up things
  duck:"excited",bible:"excited",
  // Phones & tech
  phone:"phone",tv:"use",gpc:"use",gpc2:"use",
  // People / talk
  dino:"talk",gnome:"spooky",cat:"talk",dog:"talk",
  // Heavy lifting / pushing
  clothespile:"push",laundry:"push",rice:"push",myst:"push",
  // Mirror = vain
  mirror:"mirror",vmirror:"mirror",mirror2:"mirror",gymmirror:"mirror",
  // Stairs
  stairs:"excited",ustairsF:"excited",bstairs:"excited",bstairsU:"excited",
  // Default look/open/use handled by verb
};

function initPortrait(){
  portraitCanvas=document.getElementById("dlg-portrait-canvas");
  if(!portraitCanvas)return;
  portraitCtx=portraitCanvas.getContext("2d");
  startPortraitLoop();
}

function startPortraitLoop(){
  if(portraitAnim)cancelAnimationFrame(portraitAnim);
  function loop(){
    portraitTick++;
    if(portraitCanvas&&document.getElementById("dlg").classList.contains("on")){
      drawPortrait(portraitCtx,portraitMode,portraitTick);
    }
    portraitAnim=requestAnimationFrame(loop);
  }
  portraitAnim=requestAnimationFrame(loop);
}

function setPortraitMode(mode){
  portraitMode=mode;portraitTick=0;
  var portrait=document.getElementById("dlg-portrait");
  if(!portrait)return;
  // Border color by mode
  var colors={
    look:"#FFD700",use:"#00CED1",take:"#FFD700",talk:"#FF69B4",open:"#FF8C00",
    push:"#CD5C5C",key:"#FFD700",spooky:"#9B59B6",food:"#2ecc71",sacred:"#FFD700",
    phone:"#00CED1",mirror:"#FF69B4",excited:"#FFD700",curious:"#00CED1",hurt:"#e74c3c"
  };
  portrait.style.borderColor=colors[mode]||"#FFD700";
  // Glow by mode
  var glows={spooky:"rgba(155,89,182,0.4)",sacred:"rgba(255,215,0,0.5)",key:"rgba(255,215,0,0.6)",excited:"rgba(255,215,0,0.5)",hurt:"rgba(231,76,60,0.4)"};
  portrait.style.boxShadow="0 0 16px "+(glows[mode]||"rgba(255,215,0,0.15)");
}

function drawPortrait(c,mode,t){
  if(!c)return;
  c.clearRect(0,0,60,60);

  // Background gradient by mode
  var bgColors={
    look:"#1a0a2e",use:"#0a2a3e",take:"#1a1a0e",talk:"#2e0a1e",open:"#1a0a0a",
    push:"#2e1a0a",key:"#2a2000",spooky:"#1a0a2e",food:"#0a1a0a",sacred:"#2a1a00",
    phone:"#0a1a2e",mirror:"#1a0a1e",excited:"#1a1400",curious:"#0a1a2e",hurt:"#2e0a0a"
  };
  c.fillStyle=bgColors[mode]||"#1a0a2e";c.fillRect(0,0,60,60);

  // Soft radial bg glow
  var glowC={spooky:"rgba(155,89,182,0.2)",sacred:"rgba(255,215,0,0.15)",key:"rgba(255,215,0,0.2)",food:"rgba(46,204,113,0.15)",hurt:"rgba(231,76,60,0.2)"};
  if(glowC[mode]){var g=c.createRadialGradient(30,35,2,30,35,28);g.addColorStop(0,glowC[mode]);g.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=g;c.fillRect(0,0,60,60);}

  // Draw K'Dee portrait at center
  var bob=Math.sin(t*0.08)*1.2;
  var tilt=0,eyeW=3,eyeH=3,mouthType="smile",blush=false,sweat=false,sparkle=false,wide=false,headTilt=0,armUp=false,armOut=false,brows="normal";

  if(mode==="look"){tilt=Math.sin(t*0.06)*3;brows="curious";}
  else if(mode==="use"){armUp=true;brows="determined";}
  else if(mode==="take"){mouthType="grin";sparkle=true;brows="happy";}
  else if(mode==="talk"){mouthType=Math.floor(t/6)%2===0?"open":"smile";brows="curious";}
  else if(mode==="open"){wide=true;mouthType="o";brows="surprised";}
  else if(mode==="push"){bob+=Math.sin(t*0.3)*2;brows="strain";sweat=true;mouthType="strain";}
  else if(mode==="key"){sparkle=true;mouthType="grin";bob=Math.sin(t*0.15)*3;brows="happy";}
  else if(mode==="spooky"){wide=true;mouthType="o";bob+=Math.sin(t*0.1)*0.5;brows="scared";}
  else if(mode==="food"){mouthType=Math.floor(t/8)%3===0?"open":"smile";blush=true;brows="happy";}
  else if(mode==="sacred"){bob=Math.sin(t*0.04)*0.8;brows="amazed";sparkle=true;mouthType="o";}
  else if(mode==="phone"){armUp=true;mouthType=Math.floor(t/10)%2===0?"open":"smile";brows="curious";}
  else if(mode==="mirror"){blush=true;mouthType="smile";brows="pleased";tilt=Math.sin(t*0.05)*2;}
  else if(mode==="excited"){bob=Math.sin(t*0.15)*3;sparkle=true;mouthType="grin";brows="happy";blush=true;}
  else if(mode==="curious"){tilt=Math.sin(t*0.07)*4;brows="curious";mouthType="hmm";}
  else if(mode==="hurt"){bob+=Math.sin(t*0.3)*2;brows="pain";mouthType="pain";wide=true;}

  // === DRAW K'DEE PORTRAIT ===
  c.save();c.translate(30,42+bob);c.rotate(tilt*Math.PI/180);

  // Body
  var bodyColor="#FF69B4";
  if(mode==="push")bodyColor="#FF85C8";
  c.fillStyle=bodyColor;c.beginPath();
  c.moveTo(-8,-12);c.lineTo(-9,-2);c.lineTo(9,-2);c.lineTo(8,-12);c.closePath();c.fill();
  D(c,-1,-11,2,8,"#FF85C8");// shirt detail

  // Arms
  if(armUp){
    D(c,-12,-16,4,8,"#FDBCB4");c.fillStyle="#FDBCB4";c.beginPath();c.arc(-10,-8,3,0,Math.PI*2);c.fill();
    D(c,8,-20,4,12,"#FDBCB4");c.fillStyle="#FDBCB4";c.beginPath();c.arc(10,-8,3,0,Math.PI*2);c.fill();
  } else if(mode==="push"||mode==="take"){
    var aoff=Math.min(t*0.3,6);
    D(c,-12,-14+aoff,4,10,"#FDBCB4");c.fillStyle="#FDBCB4";c.beginPath();c.arc(-10,-4,3,0,Math.PI*2);c.fill();
    D(c,8,-14-aoff,4,10,"#FDBCB4");c.fillStyle="#FDBCB4";c.beginPath();c.arc(10,-4,3,0,Math.PI*2);c.fill();
  } else {
    D(c,-12,-14,4,10,"#FDBCB4");c.fillStyle="#FDBCB4";c.beginPath();c.arc(-10,-4,3,0,Math.PI*2);c.fill();
    D(c,8,-14,4,10,"#FDBCB4");c.fillStyle="#FDBCB4";c.beginPath();c.arc(10,-4,3,0,Math.PI*2);c.fill();
  }

  // Head
  c.fillStyle="#FDBCB4";c.beginPath();c.arc(0,-22,10,0,Math.PI*2);c.fill();

  // Hair
  c.fillStyle="#F0E68C";c.beginPath();c.arc(0,-27,10,Math.PI,2*Math.PI);c.fill();
  D(c,-10,-26,5,10,"#F0E68C");D(c,5,-26,5,10,"#F0E68C");
  // Hair shine
  c.fillStyle="rgba(255,255,200,0.3)";c.beginPath();c.arc(3,-29,4,0,Math.PI*2);c.fill();

  // Eyebrows
  c.strokeStyle="#8B6914";c.lineWidth=1.5;
  if(brows==="normal"||brows==="pleased"){c.beginPath();c.moveTo(-7,-24);c.lineTo(-3,-24);c.stroke();c.beginPath();c.moveTo(3,-24);c.lineTo(7,-24);c.stroke();}
  else if(brows==="curious"){c.beginPath();c.moveTo(-7,-25);c.quadraticCurveTo(-5,-23,-3,-24);c.stroke();c.beginPath();c.moveTo(3,-24);c.lineTo(7,-24);c.stroke();}
  else if(brows==="happy"){c.beginPath();c.moveTo(-7,-25);c.quadraticCurveTo(-5,-26,-3,-25);c.stroke();c.beginPath();c.moveTo(3,-25);c.quadraticCurveTo(5,-26,7,-25);c.stroke();}
  else if(brows==="determined"){c.beginPath();c.moveTo(-7,-25);c.lineTo(-3,-26);c.stroke();c.beginPath();c.moveTo(3,-26);c.lineTo(7,-25);c.stroke();}
  else if(brows==="surprised"||brows==="amazed"||brows==="scared"){c.beginPath();c.moveTo(-7,-26);c.quadraticCurveTo(-5,-28,-3,-27);c.stroke();c.beginPath();c.moveTo(3,-27);c.quadraticCurveTo(5,-28,7,-26);c.stroke();}
  else if(brows==="strain"){c.beginPath();c.moveTo(-7,-24);c.lineTo(-3,-26);c.stroke();c.beginPath();c.moveTo(3,-26);c.lineTo(7,-24);c.stroke();}
  else if(brows==="pain"){c.beginPath();c.moveTo(-7,-24);c.lineTo(-3,-26);c.stroke();c.beginPath();c.moveTo(3,-26);c.lineTo(7,-24);c.stroke();}

  // Eyes
  var ew=wide?4:3,eh=wide?4:3;
  if(mode==="spooky"||mode==="hurt")eh=4;
  c.fillStyle="#fff";c.fillRect(-6,-23,ew+1,eh+1);c.fillRect(2,-23,ew+1,eh+1);
  var eyeCol=(mode==="spooky"||mode==="hurt")?"#e74c3c":"#00AA44";
  c.fillStyle=eyeCol;c.fillRect(-5,-22,ew-1,eh-1);c.fillRect(3,-22,ew-1,eh-1);
  c.fillStyle="#fff";c.fillRect(-5,-23,1,1);c.fillRect(3,-23,1,1);

  // Mouth
  c.strokeStyle="#e75480";c.lineWidth=1.2;
  if(mouthType==="smile"){c.beginPath();c.arc(0,-17,4,0.1*Math.PI,0.9*Math.PI);c.stroke();}
  else if(mouthType==="grin"){c.beginPath();c.arc(0,-16,5,0.05*Math.PI,0.95*Math.PI);c.stroke();c.fillStyle="#e75480";c.fill();}
  else if(mouthType==="open"||mouthType==="o"){c.fillStyle="#c0392b";c.beginPath();c.arc(0,-17,3,0,Math.PI*2);c.fill();}
  else if(mouthType==="hmm"){c.beginPath();c.moveTo(-3,-16);c.lineTo(3,-16);c.stroke();}
  else if(mouthType==="strain"){c.beginPath();c.moveTo(-4,-16);c.quadraticCurveTo(0,-14,4,-16);c.stroke();}
  else if(mouthType==="pain"){c.beginPath();c.moveTo(-4,-15);c.quadraticCurveTo(0,-17,4,-15);c.stroke();}

  // Blush
  if(blush){c.save();c.globalAlpha=0.25;c.fillStyle="#FF69B4";c.beginPath();c.ellipse(-7,-19,4,2,0,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(7,-19,4,2,0,0,Math.PI*2);c.fill();c.restore();}

  // Sweat drop
  if(sweat&&Math.floor(t/20)%2===0){c.fillStyle="#87CEEB";c.beginPath();c.moveTo(12,-28);c.quadraticCurveTo(14,-26,12,-24);c.closePath();c.fill();}

  c.restore();

  // Sparkles around portrait
  if(sparkle){
    var sparkPositions=[[10,8],[50,10],[8,50],[52,52],[30,5],[5,30]];
    sparkPositions.forEach(function(sp,si){
      var phase=t*0.15+si*1.1;
      var alpha=0.4+0.4*Math.sin(phase);
      var sz=1+Math.sin(phase*1.3)*0.8;
      c.save();c.globalAlpha=alpha;c.fillStyle="#FFD700";
      c.beginPath();c.arc(sp[0],sp[1],sz,0,Math.PI*2);c.fill();
      c.restore();
    });
  }

  // Special overlays
  if(mode==="spooky"){
    c.save();c.globalAlpha=0.08+0.06*Math.sin(t*0.1);c.fillStyle="#9B59B6";c.fillRect(0,0,60,60);c.restore();
  }
  if(mode==="sacred"){
    c.save();c.globalAlpha=0.06+0.04*Math.sin(t*0.08);c.fillStyle="#FFD700";c.fillRect(0,0,60,60);c.restore();
    // Halo
    c.save();c.globalAlpha=0.4+0.2*Math.sin(t*0.1);
    c.strokeStyle="#FFD700";c.lineWidth=1.5;c.beginPath();c.arc(30,16,8,0,Math.PI*2);c.stroke();
    c.restore();
  }
  if(mode==="key"){
    // Key sparkle trail
    c.save();c.globalAlpha=0.6+0.3*Math.sin(t*0.2);
    c.fillStyle="#FFD700";c.font="bold 12px serif";c.textAlign="center";
    c.fillText("\uD83D\uDD11",30,56);
    c.restore();
  }
  if(mode==="phone"){
    c.save();c.fillStyle="#222";c.fillRect(22,8,16,24);c.fillStyle="#1a3a5a";c.fillRect(23,9,14,20);
    c.fillStyle="rgba(0,200,255,0.5)";c.font="5px monospace";c.textAlign="center";c.fillText("bzz",30,20);
    c.restore();
  }
}

// Determine portrait mode from hotspot id and verb
function getPortraitMode(hid,verb){
  // Special per-hotspot overrides
  if(HOTSPOT_REACTIONS[hid])return HOTSPOT_REACTIONS[hid];
  // Fallback by verb
  var verbModes={look:"look",use:"use",take:"take",talk:"talk",open:"open",push:"push"};
  return verbModes[verb]||"look";
}
function drawBattleKdee(c,x,y,pose,timer){
  var t=timer||0;
  var bob=Math.sin(frameTick*0.05)*1.5;
  var sc=1.8;// battle scale
  c.save();c.translate(x,y);c.scale(sc,sc);
  var ax=0;

  // HP-synced expressions (mirror world K'Dee)
  var hpTired=kdeeHP<=8&&kdeeHP>4;
  var hpGrimace=kdeeHP<=4&&kdeeHP>0;
  var hpFumes=kdeeHP<=0;
  var blinkPhase=frameTick%220;
  var blinking=blinkPhase<3;

  // Action offsets
  var sw=0,nag=0,pw=0,glow=0.3;
  if(pose==="slap"){ax=Math.min(t*2,12);sw=Math.sin(t*0.8)*8;}
  if(pose==="nag"){nag=Math.sin(t*0.5)*3;}
  if(pose==="purse"){ax=Math.min(t*1.5,8);pw=Math.sin(t*0.6)*15;}
  if(pose==="item"){glow=0.3+0.3*Math.sin(t*0.3);}
  if(pose==="hurt"){ax=Math.sin(t*2)*4;bob+=2;}

  // Shadow
  c.save();c.globalAlpha=0.18;c.fillStyle="#000";
  c.beginPath();c.ellipse(ax,2,10,3,0,0,Math.PI*2);c.fill();c.restore();

  // Legs — gradient jeans
  var lk=pose==="hurt"?Math.sin(t)*2:0;
  var jg=c.createLinearGradient(ax-4,-3,ax+5,3);
  jg.addColorStop(0,"#4a79f5");jg.addColorStop(1,"#2a4aaa");
  c.fillStyle=jg;
  c.fillRect(ax-4+lk,-3+bob,4,6);c.fillRect(ax+1-lk,-3+bob,4,6);
  c.fillStyle="#222";
  c.fillRect(ax-5+lk,2+bob,5,3);c.fillRect(ax+1-lk,2+bob,5,3);
  // Shoe highlight
  c.fillStyle="rgba(255,255,255,0.12)";
  c.fillRect(ax-5+lk,2+bob,3,1);c.fillRect(ax+1-lk,2+bob,3,1);

  // Body — gradient pink top
  var bg=c.createLinearGradient(ax-8,-13+bob,ax+8,-3+bob);
  bg.addColorStop(0,"#FF9FD4");bg.addColorStop(0.5,P.pink);bg.addColorStop(1,"#E0509A");
  c.fillStyle=bg;
  c.beginPath();
  c.moveTo(ax-7,-12+bob);c.lineTo(ax-8,-3+bob);c.lineTo(ax+8,-3+bob);c.lineTo(ax+7,-12+bob);
  c.closePath();c.fill();
  // Collar V
  c.strokeStyle="rgba(255,255,255,0.35)";c.lineWidth=0.8;
  c.beginPath();c.moveTo(ax-2,-12+bob);c.lineTo(ax,-9+bob);c.lineTo(ax+2,-12+bob);c.stroke();
  // Shirt seam centre
  c.strokeStyle="rgba(200,60,120,0.4)";c.lineWidth=0.6;
  c.beginPath();c.moveTo(ax,-9+bob);c.lineTo(ax,-3+bob);c.stroke();
  // Hem shadow line
  c.strokeStyle="rgba(0,0,0,0.18)";c.lineWidth=1;
  c.beginPath();c.moveTo(ax-8,-3+bob);c.lineTo(ax+8,-3+bob);c.stroke();

  // Skirt band
  var sg=c.createLinearGradient(ax-8,-6+bob,ax+8,-3+bob);
  sg.addColorStop(0,"#3a5fd0");sg.addColorStop(1,"#2a4aaa");
  c.fillStyle=sg;c.fillRect(ax-8,-5+bob,16,4);
  c.strokeStyle="rgba(100,140,255,0.3)";c.lineWidth=0.5;
  c.beginPath();c.moveTo(ax-8,-4+bob);c.lineTo(ax+8,-4+bob);c.stroke();

  // Arms
  if(pose==="slap"&&t>0){
    c.save();c.translate(ax+7,-12+bob);c.rotate(-0.5+sw*0.05);
    D(c,0,0,4,12,P.pink);c.fillStyle=P.skin;c.beginPath();c.arc(2,13,2.5,0,Math.PI*2);c.fill();
    // Cuff
    c.strokeStyle="rgba(255,255,255,0.3)";c.lineWidth=0.8;c.strokeRect(0,9,4,2);
    c.restore();
    D(c,ax-10,-12+bob,4,10,P.pink);
    c.strokeStyle="rgba(255,255,255,0.3)";c.lineWidth=0.8;c.strokeRect(ax-10,-4+bob,4,2);
  }else if(pose==="purse"&&t>0){
    c.save();c.translate(ax+7,-12+bob);c.rotate(-0.8+pw*0.03);
    D(c,0,0,4,14,P.pink);
    RR(c,-2,12,10,8,2,"#8B4513");D(c,-1,10,8,2,P.gold);
    c.restore();
    D(c,ax-10,-12+bob,4,10,P.pink);
  }else if(pose==="nag"&&t>0){
    c.save();c.translate(ax+7,-12+bob);c.rotate(-0.3);
    D(c,0,0,4,10,P.pink);c.fillStyle=P.skin;c.beginPath();c.arc(2,11,2.5,0,Math.PI*2);c.fill();
    D(c,1,7,2,5,P.skin);
    c.restore();
    D(c,ax-10,-12+bob+nag,4,10,P.pink);
  }else if(pose==="item"&&t>0){
    D(c,ax-10,-12+bob,4,10,P.pink);
    c.save();c.translate(ax+7,-14+bob);
    D(c,0,0,4,10,P.pink);
    c.fillStyle="rgba(0,206,209,"+glow+")";
    c.beginPath();c.arc(3,0,6,0,Math.PI*2);c.fill();
    c.restore();
  }else{
    D(c,ax-10,-12+bob,4,10,P.pink);D(c,ax+6,-12+bob,4,10,P.pink);
    // Cuffs
    c.strokeStyle="rgba(255,255,255,0.28)";c.lineWidth=0.8;
    c.strokeRect(ax-10,-4+bob,4,2);c.strokeRect(ax+6,-4+bob,4,2);
    c.fillStyle=P.skin;
    c.beginPath();c.arc(ax-8,-2+bob,2.5,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(ax+8,-2+bob,2.5,0,Math.PI*2);c.fill();
  }

  // Head — gradient skin
  var hg=c.createRadialGradient(ax-2,-22+bob,1,ax,-20+bob,9);
  hg.addColorStop(0,"#FFD0BE");hg.addColorStop(1,"#E8A898");
  c.fillStyle=hg;c.beginPath();c.arc(ax,-20+bob,9,0,Math.PI*2);c.fill();

  // Hair — bezier strands (matches world K'Dee)
  c.fillStyle=P.hair;
  // Left strand
  c.beginPath();
  c.moveTo(ax-9,-24+bob);
  c.bezierCurveTo(ax-12,-18+bob,ax-11,-8+bob,ax-9,-2+bob);
  c.bezierCurveTo(ax-8,1+bob,ax-6,2+bob,ax-5,0+bob);
  c.bezierCurveTo(ax-6,-9+bob,ax-7,-19+bob,ax-6,-24+bob);
  c.closePath();c.fill();
  // Right strand
  c.beginPath();
  c.moveTo(ax+5,-24+bob);
  c.bezierCurveTo(ax+8,-18+bob,ax+7,-8+bob,ax+5,-2+bob);
  c.bezierCurveTo(ax+4,1+bob,ax+3,1+bob,ax+3,-1+bob);
  c.bezierCurveTo(ax+3,-10+bob,ax+4,-19+bob,ax+3,-24+bob);
  c.closePath();c.fill();
  // Top cap
  c.beginPath();c.arc(ax,-24+bob,9,Math.PI,2*Math.PI);c.fill();
  // Hair highlight
  c.fillStyle="rgba(255,255,200,0.32)";
  c.beginPath();c.arc(ax-2,-26+bob,3,Math.PI*1.1,Math.PI*1.9);c.fill();

  // Eyes — HP-aware + blink
  var isAngry=pose==="nag"||hpFumes;
  var isTired=hpTired&&pose==="idle";
  if(pose==="hurt"){
    c.strokeStyle="#333";c.lineWidth=1;
    c.beginPath();c.moveTo(ax-5,-21+bob);c.lineTo(ax-2,-19+bob);c.moveTo(ax-2,-21+bob);c.lineTo(ax-5,-19+bob);c.stroke();
    c.beginPath();c.moveTo(ax+2,-21+bob);c.lineTo(ax+5,-19+bob);c.moveTo(ax+5,-21+bob);c.lineTo(ax+2,-19+bob);c.stroke();
  }else if(blinking){
    c.strokeStyle="#333";c.lineWidth=1.2;
    c.beginPath();c.moveTo(ax-5,-20+bob);c.lineTo(ax-2,-20+bob);c.stroke();
    c.beginPath();c.moveTo(ax+1,-20+bob);c.lineTo(ax+4,-20+bob);c.stroke();
  }else if(isAngry){
    c.fillStyle="#fff";c.fillRect(ax-5,-21+bob,4,3);c.fillRect(ax+1,-21+bob,4,3);
    c.fillStyle=P.eye;c.fillRect(ax-4,-20+bob,2,2);c.fillRect(ax+2,-20+bob,2,2);
    c.strokeStyle="#333";c.lineWidth=1;
    c.beginPath();c.moveTo(ax-6,-23+bob);c.lineTo(ax-2,-22+bob);c.stroke();
    c.beginPath();c.moveTo(ax+6,-23+bob);c.lineTo(ax+2,-22+bob);c.stroke();
  }else if(isTired||hpGrimace){
    // Half-lidded tired eyes
    c.fillStyle="#fff";c.fillRect(ax-5,-21+bob,4,3);c.fillRect(ax+1,-21+bob,4,3);
    c.fillStyle=P.eye;c.fillRect(ax-4,-20+bob,2,2);c.fillRect(ax+2,-20+bob,2,2);
    c.fillStyle="rgba(230,180,140,0.7)";c.fillRect(ax-5,-21+bob,4,2);c.fillRect(ax+1,-21+bob,4,2);
    c.strokeStyle="#555";c.lineWidth=0.7;
    c.beginPath();c.moveTo(ax-5,-21+bob);c.lineTo(ax-1,-21+bob);c.stroke();
    c.beginPath();c.moveTo(ax+1,-21+bob);c.lineTo(ax+5,-21+bob);c.stroke();
  }else{
    c.fillStyle="#fff";c.fillRect(ax-5,-21+bob,4,3);c.fillRect(ax+1,-21+bob,4,3);
    c.fillStyle=P.eye;c.fillRect(ax-4,-20+bob,2,2);c.fillRect(ax+2,-20+bob,2,2);
    c.fillStyle="#fff";c.fillRect(ax-4,-21+bob,1,1);c.fillRect(ax+2,-21+bob,1,1);
  }

  // Mouth — HP-aware
  if(pose==="nag"||hpFumes){
    // Open angry mouth
    c.fillStyle="#333";c.beginPath();c.arc(ax,-15+bob,2,0,Math.PI*2);c.fill();
  }else if(pose==="hurt"||hpGrimace){
    // Grimace / frown
    c.strokeStyle="#333";c.lineWidth=1;c.beginPath();c.arc(ax,-14+bob,2,Math.PI+0.3,2*Math.PI-0.3);c.stroke();
  }else if(isTired){
    // Flat tired mouth
    c.strokeStyle="#c07070";c.lineWidth=0.8;
    c.beginPath();c.moveTo(ax-2,-15+bob);c.lineTo(ax+2,-15+bob);c.stroke();
  }else{
    // Normal smile
    c.strokeStyle=P.pink;c.lineWidth=1;c.beginPath();c.arc(ax,-15+bob,3,0.1*Math.PI,0.9*Math.PI);c.stroke();
  }

  c.restore();
}

function drawBattleEnemy(c,f,x,y,pose,timer,anim){
  var t=timer||0;
  var bob=Math.sin(anim*0.04)*2;
  var sc=1.8;
  var h=f.short?-3:f.tall?5:0;
  var shake=battleState&&battleState.shakeTimer>0?Math.sin(battleState.shakeTimer*2)*4:0;

  c.save();c.translate(x+shake,y);c.scale(sc,sc);

  if(f.narcolepsy){bob=0;} // sleeping = no bob

  // Shadow
  c.save();c.globalAlpha=0.15;c.fillStyle="#000";
  c.beginPath();c.ellipse(0,2+h/2,10,3,0,0,Math.PI*2);c.fill();c.restore();

  // --- SPECIAL: Gwyneth lying down ---
  if(f.narcolepsy){
    // Horizontal body
    c.save();c.rotate(Math.PI/2*0.15);// slight angle
    D(c,-14,-2,28,7,f.shirt);// body
    D(c,-16,-2,5,6,f.pants);D(c,11,-2,5,6,f.pants);// legs
    D(c,-17,3,4,3,"#333");D(c,12,3,4,3,"#333");// shoes
    // Head
    c.fillStyle=f.skin;c.beginPath();c.arc(-6,-10,8,0,Math.PI*2);c.fill();
    c.fillStyle=f.hair;c.beginPath();c.arc(-6,-14,8,Math.PI,2*Math.PI);c.fill();
    D(c,-14,-14,4,12,f.hair);D(c,0,-14,4,10,f.hair);
    // Closed eyes
    c.strokeStyle="#333";c.lineWidth=0.8;
    c.beginPath();c.arc(-9,-10,2,0,Math.PI);c.stroke();
    c.beginPath();c.arc(-3,-10,2,0,Math.PI);c.stroke();
    c.restore();
    // Zzz
    c.fillStyle="rgba(100,150,255,0.6)";c.font="bold 7px monospace";
    var zb=Math.sin(anim*0.03)*3;
    c.fillText("z",8,-16+zb);c.font="bold 5px monospace";c.fillText("z",14,-22+zb);c.font="bold 3px monospace";c.fillText("z",18,-26+zb);
    c.restore();
    return;
  }

  // --- SPECIAL: Forest in bed ---
  if(f.beard&&f.hairStyle==="shock"){
    // Blanket/bed
    RR(c,-16,-2,32,10,3,"#8a8a70");
    // Pillow
    RR(c,-14,-7,12,6,2,"#ddd");
    // Head poking out
    c.fillStyle=f.skin;c.beginPath();c.arc(-4,-14,8,0,Math.PI*2);c.fill();
    // Shock of blonde hair
    c.fillStyle=f.hair;
    c.beginPath();c.arc(-4,-18,8,Math.PI,2*Math.PI);c.fill();
    for(var sp=0;sp<5;sp++){c.beginPath();c.moveTo(-11+sp*3.5,-21);c.lineTo(-9.5+sp*3.5,-27-sp%2*2);c.lineTo(-8+sp*3.5,-21);c.closePath();c.fill();}
    // Red beard
    c.fillStyle=f.beard;c.beginPath();c.moveTo(-9,-9);c.quadraticCurveTo(-4,-2,1,-9);c.fill();
    // Sick eyes (droopy)
    c.fillStyle="#fff";c.fillRect(-7,-15,3,2);c.fillRect(-1,-15,3,2);
    c.fillStyle="#333";c.fillRect(-6,-15,2,2);c.fillRect(0,-15,2,2);
    // Red nose
    c.fillStyle="#e74c3c";c.beginPath();c.arc(-3,-12,2,0,Math.PI*2);c.fill();
    // Tissues around
    c.fillStyle="#fff";
    c.fillRect(6,-4,5,3);c.fillRect(10,-6,4,3);c.fillRect(14,-2,4,3);
    // Thermometer
    D(c,-14,-9,2,8,"#ccc");c.fillStyle="#e74c3c";c.beginPath();c.arc(-13,-10,1.5,0,Math.PI*2);c.fill();
    c.restore();
    return;
  }

  // --- SPECIAL: Demon (Baal'thazar) ---
  if(f.demon){
    var atk=(pose==="attack"&&t>0);
    var ax=atk?-Math.min(t*1.5,8):0;
    var rage=atk?Math.sin(t*0.5)*3:0;

    // Brimstone glow behind demon
    c.save();c.globalAlpha=0.12+0.08*Math.sin(anim*0.05);c.fillStyle="#8B0000";
    c.beginPath();c.arc(ax,0,28,0,Math.PI*2);c.fill();c.restore();

    // Shadow (red-tinted)
    c.save();c.globalAlpha=0.2;c.fillStyle="#4a0000";
    c.beginPath();c.ellipse(ax,3,12,4,0,0,Math.PI*2);c.fill();c.restore();

    // Tail (animated)
    var tailSwing=Math.sin(anim*0.07)*8;
    c.strokeStyle="#6B0000";c.lineWidth=2;
    c.beginPath();
    c.moveTo(ax+4,-2+bob);
    c.quadraticCurveTo(ax+18,-8+bob+tailSwing,ax+22,-18+bob+tailSwing);
    c.stroke();
    // Tail tip (arrow)
    c.fillStyle="#6B0000";
    c.beginPath();c.arc(ax+22,-18+bob+tailSwing,3,0,Math.PI*2);c.fill();

    // Legs
    D(c,ax-4,-3+bob,4,8,"#0a0000");D(c,ax+1,-3+bob,4,8,"#0a0000");
    // Hooves
    c.fillStyle="#1a0000";c.beginPath();c.ellipse(ax-2,4+bob,4,2.5,0,0,Math.PI*2);c.fill();
    c.beginPath();c.ellipse(ax+3,4+bob,4,2.5,0,0,Math.PI*2);c.fill();

    // Body (dark robe-like)
    c.fillStyle="#1a0000";c.beginPath();
    c.moveTo(ax-8,-12+bob);c.lineTo(ax-9,-2+bob);c.lineTo(ax+9,-2+bob);c.lineTo(ax+8,-12+bob);
    c.closePath();c.fill();
    // Robe highlights (dark red)
    c.fillStyle="rgba(139,0,0,0.4)";c.fillRect(ax-2,-11+bob,2,9);

    // Wings (folded behind, tips visible)
    c.fillStyle="rgba(80,0,0,0.7)";
    c.beginPath();c.moveTo(ax-8,-12+bob);c.quadraticCurveTo(ax-22,-22+bob+rage,ax-18,-4+bob);c.lineTo(ax-8,-5+bob);c.closePath();c.fill();
    c.beginPath();c.moveTo(ax+8,-12+bob);c.quadraticCurveTo(ax+22,-22+bob-rage,ax+18,-4+bob);c.lineTo(ax+8,-5+bob);c.closePath();c.fill();
    // Wing membrane lines
    c.strokeStyle="rgba(139,0,0,0.4)";c.lineWidth=0.8;
    c.beginPath();c.moveTo(ax-8,-10+bob);c.lineTo(ax-18,-8+bob);c.stroke();
    c.beginPath();c.moveTo(ax-8,-7+bob);c.lineTo(ax-16,-3+bob);c.stroke();
    c.beginPath();c.moveTo(ax+8,-10+bob);c.lineTo(ax+18,-8+bob);c.stroke();
    c.beginPath();c.moveTo(ax+8,-7+bob);c.lineTo(ax+16,-3+bob);c.stroke();

    // Arms
    if(atk){
      c.save();c.translate(ax-8,-12+bob);c.rotate(0.5-t*0.08);
      D(c,0,0,4,12,"#c0392b");c.fillStyle="#8B0000";c.beginPath();c.arc(2,13,3,0,Math.PI*2);c.fill();
      // Claw fingers
      c.strokeStyle="#6B0000";c.lineWidth=1;
      for(var cl=0;cl<3;cl++){c.beginPath();c.moveTo(0+cl*2,12);c.lineTo(-1+cl*2,18);c.stroke();}
      c.restore();
    }else{
      D(c,ax-10,-12+bob,4,11,"#c0392b");
      D(c,ax+6,-12+bob,4,11,"#c0392b");
    }
    // Clawed hands at rest
    c.strokeStyle="#6B0000";c.lineWidth=1;
    if(!atk){
      for(var cl=0;cl<3;cl++){c.beginPath();c.moveTo(ax-9+cl,-1+bob);c.lineTo(ax-10+cl,4+bob);c.stroke();}
      for(var cl=0;cl<3;cl++){c.beginPath();c.moveTo(ax+6+cl,-1+bob);c.lineTo(ax+5+cl,4+bob);c.stroke();}
    }

    // Head (red, angular)
    c.fillStyle=f.skin;c.beginPath();c.arc(ax,-20+bob,9,0,Math.PI*2);c.fill();

    // HORNS (big, curving)
    c.fillStyle="#1a0000";
    c.beginPath();c.moveTo(ax-6,-26+bob);c.quadraticCurveTo(ax-14,-38+bob,ax-9,-44+bob);c.quadraticCurveTo(ax-7,-40+bob,ax-4,-28+bob);c.closePath();c.fill();
    c.beginPath();c.moveTo(ax+6,-26+bob);c.quadraticCurveTo(ax+14,-38+bob,ax+9,-44+bob);c.quadraticCurveTo(ax+7,-40+bob,ax+4,-28+bob);c.closePath();c.fill();
    // Horn shine
    c.fillStyle="rgba(139,0,0,0.3)";
    c.beginPath();c.moveTo(ax-6,-27+bob);c.quadraticCurveTo(ax-10,-34+bob,ax-8,-40+bob);c.quadraticCurveTo(ax-6,-36+bob,ax-5,-28+bob);c.closePath();c.fill();

    // Glowing eyes (always lit)
    var eyeGlow=0.7+0.3*Math.sin(anim*0.08);
    c.save();c.globalAlpha=eyeGlow;c.fillStyle="#FF4500";
    c.beginPath();c.ellipse(ax-3,-21+bob,3,2,0,0,Math.PI*2);c.fill();
    c.beginPath();c.ellipse(ax+3,-21+bob,3,2,0,0,Math.PI*2);c.fill();
    c.restore();
    // Bright centers
    c.fillStyle="#FFD700";
    c.beginPath();c.arc(ax-3,-21+bob,1.2,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(ax+3,-21+bob,1.2,0,Math.PI*2);c.fill();

    // Menacing mouth / fangs
    if(atk){
      c.fillStyle="#0a0000";c.beginPath();c.arc(ax,-14+bob,4,0,Math.PI);c.fill();
      // Fangs
      c.fillStyle="#fff";
      c.beginPath();c.moveTo(ax-3,-14+bob);c.lineTo(ax-2,-18+bob);c.lineTo(ax-1,-14+bob);c.closePath();c.fill();
      c.beginPath();c.moveTo(ax+1,-14+bob);c.lineTo(ax+2,-18+bob);c.lineTo(ax+3,-14+bob);c.closePath();c.fill();
    }else{
      c.strokeStyle="#6B0000";c.lineWidth=1;
      c.beginPath();c.arc(ax,-14+bob,3,0.1*Math.PI,0.9*Math.PI);c.stroke();
      // Subtle fangs at rest
      c.fillStyle="#ddd";
      c.beginPath();c.moveTo(ax-2,-14+bob);c.lineTo(ax-1.5,-17+bob);c.lineTo(ax-1,-14+bob);c.closePath();c.fill();
      c.beginPath();c.moveTo(ax+1,-14+bob);c.lineTo(ax+1.5,-17+bob);c.lineTo(ax+2,-14+bob);c.closePath();c.fill();
    }

    // Floating ember particles around demon
    for(var em=0;em<4;em++){
      var ea=em*Math.PI/2+anim*0.04;
      var er=12+Math.sin(anim*0.05+em)*4;
      c.save();c.globalAlpha=0.3+0.2*Math.sin(anim*0.06+em);
      c.fillStyle="#FF4500";c.beginPath();c.arc(ax+Math.cos(ea)*er,-10+bob+Math.sin(ea)*er,1.5,0,Math.PI*2);c.fill();
      c.restore();
    }

    c.restore();
    return;
  }

  // --- REGULAR CHARACTER ---
  var atk=(pose==="attack"&&t>0);
  var ax=atk?-Math.min(t*1.5,8):0;

  // Legs
  var lk=atk?Math.sin(t*0.6)*2:0;
  D(c,ax-4+lk,-3+bob+h/2,4,6+h/2,f.pants||"#4169E1");
  D(c,ax+1-lk,-3+bob+h/2,4,6+h/2,f.pants||"#4169E1");
  D(c,ax-5+lk,2+h+bob,5,3,"#333");D(c,ax+1-lk,2+h+bob,5,3,"#333");

  // Body
  c.fillStyle=f.shirt;c.beginPath();
  c.moveTo(ax-7,-12+bob-h/2);c.lineTo(ax-8,-3+bob);c.lineTo(ax+8,-3+bob);c.lineTo(ax+7,-12+bob-h/2);
  c.closePath();c.fill();

  // Oil stains for Daed — on shirt/body only, not face
  if(f.oily){
    c.fillStyle="rgba(40,30,10,0.45)";
    [[ax-3,2],[ax+3,0],[ax+1,4],[ax-4,1],[ax+5,3]].forEach(function(p){
      c.beginPath();c.arc(p[0],p[1]+bob,1.5,0,Math.PI*2);c.fill();
    });
    // Oil drip from shirt hem
    var drip=(anim*0.05)%1;
    c.fillStyle="rgba(40,30,10,0.25)";c.beginPath();c.arc(ax+4,4+bob+drip*6,1,0,Math.PI*2);c.fill();
  }

  // Arms
  if(atk){
    // Attack arm
    c.save();c.translate(ax-8,-12+bob-h/2);c.rotate(0.5-t*0.08);
    D(c,0,0,4,12,f.shirt);c.fillStyle=f.skin;c.beginPath();c.arc(2,13,2.5,0,Math.PI*2);c.fill();
    c.restore();
  }else{
    D(c,ax-10,-12+bob-h/2,4,11,f.shirt);
    c.fillStyle=f.skin;c.beginPath();c.arc(ax-8,-1+bob,2.5,0,Math.PI*2);c.fill();
  }
  D(c,ax+6,-12+bob-h/2,4,11,f.shirt);
  c.fillStyle=f.skin;c.beginPath();c.arc(ax+8,-1+bob,2.5,0,Math.PI*2);c.fill();
  if(f.oily){
    c.fillStyle="rgba(40,30,10,0.35)";
    c.beginPath();c.arc(ax-8,-1+bob,3,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(ax+8,-1+bob,3,0,Math.PI*2);c.fill();
  }

  // Halo for Space Jesus
  if(f.halo){
    var hpulse=0.6+0.4*Math.sin(anim*0.06);
    c.save();c.globalAlpha=hpulse*0.9;
    c.strokeStyle=P.gold;c.lineWidth=2.5;
    c.beginPath();c.arc(ax,-30+bob-h/2,12,0,Math.PI*2);c.stroke();
    c.globalAlpha=hpulse*0.15;c.fillStyle=P.gold;
    c.beginPath();c.arc(ax,-30+bob-h/2,16,0,Math.PI*2);c.fill();
    c.restore();
  }

  // Mullet back drawn BEFORE head so it sits behind the face
  if(f.hairStyle==="mullet"){
    c.fillStyle=f.hair;
    c.beginPath();c.moveTo(ax-5,-20+bob-h/2);
    c.quadraticCurveTo(ax-14,-8+bob-h/2+Math.sin(anim*0.04)*2,ax-10,4+bob-h/2);
    c.quadraticCurveTo(ax-4,-4+bob-h/2,ax+2,-20+bob-h/2);
    c.fill();
  }

  // Head
  c.fillStyle=f.skin;c.beginPath();c.arc(ax,-20+bob-h/2,9,0,Math.PI*2);c.fill();

  // Hair
  c.fillStyle=f.hair;
  if(f.hairStyle==="shaggy"){
    c.beginPath();c.arc(ax,-24+bob-h/2,9,Math.PI,2*Math.PI);c.fill();
    D(c,ax-9,-23+bob-h/2,5,8,f.hair);D(c,ax+5,-23+bob-h/2,5,8,f.hair);
    D(c,ax-7,-21+bob-h/2,3,5,f.hair);D(c,ax+5,-21+bob-h/2,3,5,f.hair);
  }else if(f.hairStyle==="long"){
    c.beginPath();c.arc(ax,-24+bob-h/2,9,Math.PI,2*Math.PI);c.fill();
    D(c,ax-9,-23+bob-h/2,4,15,f.hair);D(c,ax+5,-23+bob-h/2,4,15,f.hair);
  }else if(f.hairStyle==="dark"){
    c.beginPath();c.arc(ax,-24+bob-h/2,9,Math.PI,2*Math.PI);c.fill();
    D(c,ax-8,-24+bob-h/2,16,4,f.hair);
  }else if(f.hairStyle==="mullet"){
    // Business in the front — top of head only (back already drawn above)
    c.beginPath();c.arc(ax,-24+bob-h/2,9,Math.PI,2*Math.PI);c.fill();
    D(c,ax-7,-24+bob-h/2,14,4,f.hair);
  }

  // Trucker hat
  if(f.truckerHat){
    RR(c,ax-10,-31+bob-h/2,20,8,3,"#cc0000");
    D(c,ax-12,-24+bob-h/2,24,4,"#cc0000");
    // Hat text
    c.fillStyle="#fff";c.font="bold 3px monospace";c.fillText("CAR",ax-6,-27+bob-h/2);
  }

  // Moustache
  if(f.moustache){
    c.fillStyle="#1a1a1a";
    c.beginPath();
    c.moveTo(ax-5,-14+bob-h/2);
    c.quadraticCurveTo(ax-7,-12+bob-h/2,ax-6,-11+bob-h/2);
    c.quadraticCurveTo(ax,-13+bob-h/2,ax+6,-11+bob-h/2);
    c.quadraticCurveTo(ax+7,-12+bob-h/2,ax+5,-14+bob-h/2);
    c.quadraticCurveTo(ax,-12+bob-h/2,ax-5,-14+bob-h/2);
    c.fill();
  }

  // Beard for Forest (handled in special case above)

  // Eyes
  c.fillStyle="#fff";c.fillRect(ax-5,-21+bob-h/2,4,3);c.fillRect(ax+1,-21+bob-h/2,4,3);
  c.fillStyle="#333";c.fillRect(ax-4,-20+bob-h/2,2,2);c.fillRect(ax+2,-20+bob-h/2,2,2);
  c.fillStyle="#fff";c.fillRect(ax-4,-21+bob-h/2,1,1);c.fillRect(ax+2,-21+bob-h/2,1,1);

  // Mouth
  c.strokeStyle="#333";c.lineWidth=0.8;
  if(atk){
    c.fillStyle="#333";c.beginPath();c.arc(ax,-14+bob-h/2,2,0,Math.PI*2);c.fill();
  }else{
    c.beginPath();c.arc(ax,-14+bob-h/2,2.5,0.1*Math.PI,0.9*Math.PI);c.stroke();
  }

  c.restore();
}

/* ===== DRAW BATTLE SCENE ===== */
function drawBattle(c){
  var bs=battleState;if(!bs)return;
  var f=bs.fighter;

  // === VS INTRO SPLASH (cinematic) ===
  if(bs.phase==="vsIntro"){
    var vt=bs.vsTimer;// 150→0
    // Phase breakdown:
    // 150-110: K'Dee slides in from left, pink flash
    // 110-70:  Enemy slides in from right, color flash
    // 70-30:   VS text zooms in + shake
    // 30-0:    Freeze frame hold

    c.fillStyle="#0a0a1a";c.fillRect(0,0,CW,CH);

    // --- fighter color panels ---
    var kPanel=Math.max(0,Math.min(1,(150-vt)/40));// 0→1 as vt 150→110
    var ePanel=Math.max(0,Math.min(1,(110-vt)/40));// 0→1 as vt 110→70

    // Pink panel (left half)
    c.save();
    c.globalAlpha=0.18*kPanel;
    c.fillStyle="#FF69B4";c.fillRect(0,0,CW/2,CH);
    c.restore();

    // Enemy color panel (right half)
    var frgb=f.color||"#7766cc";
    var fr=parseInt(frgb.slice(1,3),16)||119,fg2=parseInt(frgb.slice(3,5),16)||102,fb=parseInt(frgb.slice(5,7),16)||204;
    c.save();
    c.globalAlpha=0.18*ePanel;
    c.fillStyle="rgb("+fr+","+fg2+","+fb+")";
    c.fillRect(CW/2,0,CW/2,CH);
    c.restore();

    // Diagonal divider line
    c.save();
    var dAlpha=Math.max(kPanel,ePanel)*0.7;
    c.globalAlpha=dAlpha;
    c.strokeStyle="rgba(255,215,0,0.9)";c.lineWidth=3;
    c.beginPath();c.moveTo(CW/2-20,0);c.lineTo(CW/2+20,CH);c.stroke();
    c.restore();

    // --- K'Dee zooms in from left ---
    if(kPanel>0){
      var kSlide=1-Math.pow(1-kPanel,3);// ease out cubic
      var kX=CW*0.28-( (1-kSlide)*CW*0.5 );// starts off-screen left
      var kSc=0.9+kSlide*0.1;// slight zoom in
      c.save();
      c.translate(kX,CH*0.5);c.scale(kSc,kSc);c.translate(-kX,-CH*0.5);
      // Pink flash on entry
      if(vt>140){c.globalAlpha=Math.max(0,(vt-140)/10)*0.5;c.fillStyle="#FF69B4";c.fillRect(0,0,CW/2,CH);c.globalAlpha=1;}
      drawBattleKdee(c,kX,CH*0.55,"idle",0);
      c.restore();

      // K'Dee name card slides in from bottom
      var kNameY=Math.min(0,(kPanel-0.6)*2.5)*40;// slides up after 60%
      c.save();
      c.globalAlpha=Math.max(0,(kPanel-0.5)*2);
      c.fillStyle="rgba(0,0,0,0.55)";c.fillRect(10,CH*0.72+kNameY,130,32);
      c.fillStyle=P.gold;c.font="bold 12px monospace";c.textAlign="left";
      c.fillText("K'DEE",18,CH*0.72+16+kNameY);
      c.fillStyle="#FF69B4";c.font="8px monospace";
      c.fillText("PLAYER",18,CH*0.72+28+kNameY);
      c.textAlign="left";
      c.restore();
    }

    // --- Enemy zooms in from right ---
    if(ePanel>0){
      var eSlide=1-Math.pow(1-ePanel,3);
      var eX=CW*0.72+( (1-eSlide)*CW*0.5 );// starts off-screen right
      var eSc=0.9+eSlide*0.1;
      c.save();
      c.translate(eX,CH*0.4);c.scale(eSc,eSc);c.translate(-eX,-CH*0.4);
      // Enemy color flash on entry
      if(vt>100&&vt<110){c.globalAlpha=Math.max(0,(vt-100)/10)*0.45;c.fillStyle="rgb("+fr+","+fg2+","+fb+")";c.fillRect(CW/2,0,CW/2,CH);c.globalAlpha=1;}
      drawBattleEnemy(c,f,eX,CH*0.42,"idle",0,bs.enemyAnim);
      c.restore();

      // Enemy name card slides in from bottom
      var eNameY=Math.min(0,(ePanel-0.6)*2.5)*40;
      c.save();
      c.globalAlpha=Math.max(0,(ePanel-0.5)*2);
      c.fillStyle="rgba(0,0,0,0.55)";c.fillRect(CW-150,CH*0.18+eNameY,140,36);
      c.fillStyle=f.color||"#aaa";c.font="bold 11px monospace";c.textAlign="right";
      c.fillText(f.name,CW-14,CH*0.18+18+eNameY);
      c.fillStyle="#aaa";c.font="8px monospace";
      c.fillText(f.title||"OPPONENT",CW-14,CH*0.18+30+eNameY);
      c.textAlign="left";
      c.restore();
    }

    // --- VS text zooms in + shake ---
    if(vt<70){
      var vsProgress=Math.min(1,(70-vt)/20);
      // zoom overshoot: scale 3→1 with bounce
      var vsScale;
      if(vsProgress<0.5){vsScale=3-vsProgress*4;}
      else{vsScale=1+(1-vsProgress)*0.4*Math.sin((vsProgress-0.5)*Math.PI*4);}
      vsScale=Math.max(1,vsScale);
      // shake: strongest at 70-60
      var shakeAmt=(vt>60&&vt<=70)?Math.sin(vt*3.7)*(70-vt)*1.5:0;
      c.save();
      c.translate(CW/2+shakeAmt,CH/2-10);
      c.scale(vsScale,vsScale);
      // Glow halo behind VS
      c.globalAlpha=Math.min(1,(70-vt)/15)*0.6;
      var vsGlow=c.createRadialGradient(0,0,5,0,0,60);
      vsGlow.addColorStop(0,"rgba(255,215,0,0.8)");vsGlow.addColorStop(1,"rgba(255,215,0,0)");
      c.fillStyle=vsGlow;c.beginPath();c.arc(0,0,60,0,Math.PI*2);c.fill();
      // VS text
      c.globalAlpha=Math.min(1,(70-vt)/12);
      c.fillStyle=P.gold;c.font="bold 52px monospace";c.textAlign="center";c.textBaseline="middle";
      // Text shadow
      c.fillStyle="rgba(0,0,0,0.6)";c.fillText("VS",3,3);
      c.fillStyle=P.gold;c.fillText("VS",0,0);
      // White outline flash right as VS appears
      if(vt>58&&vt<70){c.globalAlpha=(70-vt)/12*0.8;c.strokeStyle="#fff";c.lineWidth=3;c.strokeText("VS",0,0);}
      c.textBaseline="alphabetic";c.textAlign="left";
      c.restore();
    }

    // Screen-edge vignette
    c.save();
    var vg=c.createRadialGradient(CW/2,CH/2,CW*0.3,CW/2,CH/2,CW*0.85);
    vg.addColorStop(0,"rgba(0,0,0,0)");vg.addColorStop(1,"rgba(0,0,0,0.55)");
    c.fillStyle=vg;c.fillRect(0,0,CW,CH);
    c.restore();

    return;
  }

  // === MAIN BATTLE SCREEN ===
  // Per-fighter atmospheric background
  var bid=bs.id;
  if(bid==="milo"){
    // Kids' room — blue walls, glow-in-dark stars, scattered books
    var bg=c.createLinearGradient(0,0,0,CH);bg.addColorStop(0,"#1a2a5e");bg.addColorStop(1,"#0e1a3a");
    c.fillStyle=bg;c.fillRect(0,0,CW,CH);
    // Floor
    var fg=c.createLinearGradient(0,370,0,CH);fg.addColorStop(0,"#2a1a3e");fg.addColorStop(1,"#150e28");
    c.fillStyle=fg;c.fillRect(0,370,CW,CH-370);
    // Glow-in-dark stars
    for(var i=0;i<18;i++){
      var sx=(i*97+13)%340+10,sy=(i*61+7)%160+20;
      var sg=0.3+0.4*Math.sin(frameTick*0.05+i*0.8);
      c.fillStyle="rgba(150,255,200,"+sg+")";
      c.beginPath();for(var sp=0;sp<5;sp++){var sa=sp*Math.PI*4/5-Math.PI/2;c.lineTo(sx+3*Math.cos(sa),sy+3*Math.sin(sa));sa+=Math.PI*2/5;c.lineTo(sx+1.3*Math.cos(sa),sy+1.3*Math.sin(sa));}
      c.closePath();c.fill();
    }
    // Bunk bed silhouette
    c.fillStyle="rgba(40,30,80,0.7)";c.fillRect(0,220,90,150);c.fillRect(0,218,95,6);c.fillRect(0,290,95,5);
    // Scattered books on floor
    [[20,380,"#e74c3c",30,8],[55,390,"#3498db",26,7],[300,385,"#2ecc71",28,8],[320,395,"#FFD700",22,7]].forEach(function(b){
      c.save();c.translate(b[0]+b[3]/2,b[1]+b[4]/2);c.rotate((b[0]%7-3)*0.12);
      c.fillStyle=b[2];c.fillRect(-b[3]/2,-b[4]/2,b[3],b[4]);
      c.fillStyle="rgba(255,255,255,0.15)";c.fillRect(-b[3]/2,-b[4]/2,b[3],2);
      c.restore();
    });
    // Poster on back wall
    c.fillStyle="rgba(30,20,60,0.8)";c.fillRect(155,55,60,50);c.fillStyle="rgba(0,255,100,0.4)";c.font="bold 7px monospace";c.textAlign="center";c.fillText("GAME",185,82);c.fillText("OVER",185,93);c.textAlign="left";
  } else if(bid==="holly"){
    // Dark hallway — Holly emerges from shadow
    var bg=c.createLinearGradient(0,0,0,CH);bg.addColorStop(0,"#0d0d18");bg.addColorStop(0.6,"#1a0a2e");bg.addColorStop(1,"#0a0a10");
    c.fillStyle=bg;c.fillRect(0,0,CW,CH);
    var fg=c.createLinearGradient(0,370,0,CH);fg.addColorStop(0,"#120a1e");fg.addColorStop(1,"#080810");
    c.fillStyle=fg;c.fillRect(0,370,CW,CH-370);
    // Hallway walls — dark panels
    c.fillStyle="rgba(40,20,60,0.6)";c.fillRect(0,0,22,370);c.fillRect(338,0,22,370);
    // Faint baseboards
    c.fillStyle="rgba(80,50,90,0.5)";c.fillRect(0,340,360,8);
    // Single dim overhead light
    var lp=0.5+0.2*Math.sin(frameTick*0.03);
    c.save();c.globalAlpha=lp*0.15;
    var lg=c.createRadialGradient(180,0,5,180,0,200);lg.addColorStop(0,"#DDA0DD");lg.addColorStop(1,"rgba(0,0,0,0)");
    c.fillStyle=lg;c.fillRect(0,0,CW,CH);c.restore();
    // Doorframes further down the hall
    c.fillStyle="rgba(30,15,45,0.7)";c.fillRect(285,80,12,200);c.fillRect(305,80,50,200);
    c.fillStyle="rgba(50,25,65,0.5)";c.fillRect(307,82,46,196);
    // Shadow pool where Holly was standing
    c.save();c.globalAlpha=0.4+0.1*Math.sin(frameTick*0.04);
    var sg=c.createRadialGradient(270,300,5,270,300,80);sg.addColorStop(0,"rgba(180,100,200,0.25)");sg.addColorStop(1,"rgba(0,0,0,0)");
    c.fillStyle=sg;c.fillRect(0,0,CW,CH);c.restore();
  } else if(bid==="gwyneth"){
    // Gwyneth's room — fairy lights, dreamy blue haze
    var bg=c.createLinearGradient(0,0,0,CH);bg.addColorStop(0,"#0a1a3a");bg.addColorStop(0.5,"#0d2040");bg.addColorStop(1,"#06100e");
    c.fillStyle=bg;c.fillRect(0,0,CW,CH);
    var fg=c.createLinearGradient(0,370,0,CH);fg.addColorStop(0,"#0d1a30");fg.addColorStop(1,"#060e18");
    c.fillStyle=fg;c.fillRect(0,370,CW,CH-370);
    // Fairy lights string across top
    c.strokeStyle="rgba(100,150,200,0.3)";c.lineWidth=1;
    c.beginPath();c.moveTo(0,35);for(var fx=0;fx<CW;fx+=20)c.lineTo(fx,35+Math.sin(fx*0.15)*4);c.stroke();
    for(var fx=5;fx<CW;fx+=20){
      var fc=["#87CEEB","#00CED1","#4169E1","#DDA0DD"][(Math.floor(fx/20))%4];
      var fb=0.5+0.5*Math.sin(frameTick*0.08+fx*0.3);
      c.fillStyle=fc;c.globalAlpha=fb;c.beginPath();c.arc(fx,35+Math.sin(fx*0.15)*4,2.5,0,Math.PI*2);c.fill();c.globalAlpha=1;
    }
    // Floating Zs
    for(var zi=0;zi<4;zi++){
      var zt=(frameTick*0.4+zi*55)%220;
      c.fillStyle="rgba(135,206,235,"+(Math.max(0,1-zt/180)*0.35)+")";
      c.font="bold "+(10+zi*3)+"px monospace";c.textAlign="center";
      c.fillText("z",200+zi*18,200-zt);c.textAlign="left";
    }
    // Gwyneth's bed silhouette
    c.fillStyle="rgba(20,40,80,0.75)";c.fillRect(0,258,180,70);
    c.fillStyle="rgba(30,55,110,0.5)";c.fillRect(0,258,180,15);// pillow
    // Soft glow from bedside
    c.save();c.globalAlpha=0.12;var gg=c.createRadialGradient(30,280,5,30,280,90);gg.addColorStop(0,"#4169E1");gg.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=gg;c.fillRect(0,0,CW,CH);c.restore();
  } else if(bid==="forest"){
    // Forest's gaming den — dark with RGB LED strips and screen glow
    var bg=c.createLinearGradient(0,0,0,CH);bg.addColorStop(0,"#050510");bg.addColorStop(1,"#0a0a18");
    c.fillStyle=bg;c.fillRect(0,0,CW,CH);
    var fg=c.createLinearGradient(0,370,0,CH);fg.addColorStop(0,"#080810");fg.addColorStop(1,"#040408");
    c.fillStyle=fg;c.fillRect(0,370,CW,CH-370);
    // RGB LED strips along ceiling and floor edges — cycle colors
    var ledHue=frameTick*1.2;
    var ledColors=["#e74c3c","#ff8c00","#FFD700","#2ecc71","#3498db","#9b59b6"];
    var lc=ledColors[Math.floor(ledHue/30)%ledColors.length];
    var lcNext=ledColors[(Math.floor(ledHue/30)+1)%ledColors.length];
    c.save();c.globalAlpha=0.18;c.fillStyle=lc;c.fillRect(0,0,CW,8);c.fillRect(0,CH-8,CW,8);c.restore();
    // Gaming setup silhouette
    c.fillStyle="rgba(15,10,30,0.85)";c.fillRect(160,80,180,200);// monitor
    c.fillStyle="rgba(25,20,50,0.7)";c.fillRect(170,90,160,170);// screen
    // Screen glow — shifts with frameTick
    c.save();c.globalAlpha=0.25+0.1*Math.sin(frameTick*0.07);
    var scg=c.createRadialGradient(250,175,10,250,175,100);scg.addColorStop(0,lc);scg.addColorStop(1,"rgba(0,0,0,0)");
    c.fillStyle=scg;c.fillRect(0,0,CW,CH);c.restore();
    // Snack cans on floor
    [[290,380,"#e74c3c"],[310,376,"#3498db"],[295,388,"#e74c3c"]].forEach(function(s){
      c.fillStyle=s[2];c.fillRect(s[0],s[1],8,14);
      c.fillStyle="rgba(255,255,255,0.1)";c.fillRect(s[0]+1,s[1]+1,3,12);
    });
    // DO NOT DISTURB signs
    c.fillStyle="rgba(200,50,50,0.4)";c.font="bold 6px monospace";c.textAlign="center";
    c.fillText("DO NOT DISTURB",CW/2,60);c.textAlign="left";
  } else if(bid==="daed"){
    // Garage — oil stains, Corvette silhouette, harsh overhead light
    var bg=c.createLinearGradient(0,0,0,CH);bg.addColorStop(0,"#1a1008");bg.addColorStop(1,"#0a0804");
    c.fillStyle=bg;c.fillRect(0,0,CW,CH);
    // Concrete floor with oil stains
    var fg=c.createLinearGradient(0,370,0,CH);fg.addColorStop(0,"#2a2010");fg.addColorStop(1,"#181008");
    c.fillStyle=fg;c.fillRect(0,370,CW,CH-370);
    // Oil stain puddles
    c.save();c.globalAlpha=0.35;
    [[80,430,40,12],[200,450,30,8],[290,415,20,6]].forEach(function(o){c.fillStyle="#050401";c.beginPath();c.ellipse(o[0],o[1],o[2],o[3],0,0,Math.PI*2);c.fill();});
    // Rainbow oil sheen
    [[80,430,38,10],[200,450,28,6]].forEach(function(o){
      var og=c.createRadialGradient(o[0]-5,o[1]-2,1,o[0],o[1],o[2]);
      og.addColorStop(0,"rgba(150,50,200,0.2)");og.addColorStop(0.5,"rgba(50,200,150,0.15)");og.addColorStop(1,"rgba(200,100,50,0.1)");
      c.fillStyle=og;c.beginPath();c.ellipse(o[0],o[1],o[2],o[3],0,0,Math.PI*2);c.fill();
    });
    c.restore();
    // Corvette silhouette
    c.fillStyle="rgba(180,30,10,0.55)";
    c.beginPath();c.moveTo(0,410);c.lineTo(30,380);c.lineTo(80,368);c.lineTo(140,360);c.lineTo(200,362);c.lineTo(250,368);c.lineTo(290,372);c.lineTo(340,390);c.lineTo(360,410);c.closePath();c.fill();
    // Headlights glow
    c.save();c.globalAlpha=0.15+0.05*Math.sin(frameTick*0.04);
    var hg=c.createRadialGradient(340,375,2,340,375,80);hg.addColorStop(0,"rgba(255,220,100,0.9)");hg.addColorStop(1,"rgba(0,0,0,0)");
    c.fillStyle=hg;c.fillRect(0,0,CW,CH);c.restore();
    // Garage door at back
    c.fillStyle="rgba(35,25,10,0.8)";c.fillRect(60,30,240,280);
    for(var gi=0;gi<4;gi++)c.fillStyle="rgba(20,15,5,0.6)",c.fillRect(62,32+gi*68,236,6);
    // Single harsh worklight
    c.save();c.globalAlpha=0.12;var wl=c.createRadialGradient(180,0,5,180,0,220);wl.addColorStop(0,"rgba(255,240,180,1)");wl.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=wl;c.fillRect(0,0,CW,CH);c.restore();
  } else if(bid==="demon"){
    // Basement — pentagram glow, hellfire cracks, brimstone
    var bg=c.createLinearGradient(0,0,0,CH);bg.addColorStop(0,"#0a0000");bg.addColorStop(0.5,"#180000");bg.addColorStop(1,"#0a0000");
    c.fillStyle=bg;c.fillRect(0,0,CW,CH);
    var fg=c.createLinearGradient(0,370,0,CH);fg.addColorStop(0,"#1e0000");fg.addColorStop(1,"#0d0000");
    c.fillStyle=fg;c.fillRect(0,370,CW,CH-370);
    // Pentagram on floor — glowing
    var pp=0.4+0.4*Math.sin(frameTick*0.06);
    c.save();c.globalAlpha=pp*0.7;c.strokeStyle="#cc0000";c.lineWidth=2;
    var pcx=180,pcy=430,pr=60;
    c.beginPath();for(var pi=0;pi<5;pi++){var pa=pi*Math.PI*4/5-Math.PI/2;var pn=((pi+1)%5)*Math.PI*4/5-Math.PI/2;c.moveTo(pcx+pr*Math.cos(pa),pcy+pr*Math.sin(pa));c.lineTo(pcx+pr*Math.cos(pn),pcy+pr*Math.sin(pn));}c.stroke();
    c.strokeStyle="rgba(255,50,0,0.3)";c.lineWidth=1;c.beginPath();c.arc(pcx,pcy,pr,0,Math.PI*2);c.stroke();
    c.restore();
    // Hellfire floor cracks
    c.save();c.globalAlpha=0.3+0.2*Math.sin(frameTick*0.08);c.strokeStyle="#cc2200";c.lineWidth=1;
    [[30,480,120,520],[160,500,200,540],[220,470,310,510],[80,540,180,560]].forEach(function(cr){
      c.beginPath();c.moveTo(cr[0],cr[1]);c.lineTo((cr[0]+cr[2])/2,cr[3]-10);c.lineTo(cr[2],cr[3]);c.stroke();
    });c.restore();
    // Chains on wall
    c.strokeStyle="rgba(80,60,40,0.6)";c.lineWidth=3;
    for(var ci=0;ci<5;ci++){c.beginPath();c.moveTo(ci*80+10,0);c.lineTo(ci*80+10,120);c.stroke();}
    // Red atmospheric glow from below
    c.save();c.globalAlpha=0.18+0.08*Math.sin(frameTick*0.05);
    var dg=c.createRadialGradient(180,CH,20,180,CH,280);dg.addColorStop(0,"#8B0000");dg.addColorStop(1,"rgba(0,0,0,0)");
    c.fillStyle=dg;c.fillRect(0,0,CW,CH);c.restore();
    // Candle flickers
    [[20,200],[340,200],[20,350],[340,350]].forEach(function(cv){
      var cf=0.4+0.3*Math.sin(frameTick*0.15+cv[0]*0.04);
      c.save();c.globalAlpha=cf*0.5;var cg=c.createRadialGradient(cv[0],cv[1],1,cv[0],cv[1],30);cg.addColorStop(0,"rgba(255,150,0,0.8)");cg.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=cg;c.fillRect(cv[0]-30,cv[1]-30,60,60);c.restore();
      c.fillStyle="#FFD700";c.fillRect(cv[0]-1,cv[1]-12,2,10);// wick
      c.fillStyle="#FF8C00";c.beginPath();c.ellipse(cv[0],cv[1]-14,3,5,0,0,Math.PI*2);c.fill();
    });
  } else if(bid==="jesus"){
    // Jesus Bathroom — golden light, tiled floor, divine radiance
    var bg=c.createLinearGradient(0,0,0,CH);bg.addColorStop(0,"#1a1400");bg.addColorStop(0.4,"#2a1e00");bg.addColorStop(1,"#0e0d00");
    c.fillStyle=bg;c.fillRect(0,0,CW,CH);
    // Golden tiled floor
    for(var ti=0;ti<CW;ti+=30)for(var tj=370;tj<CH;tj+=28){
      c.fillStyle=(Math.floor(ti/30)+Math.floor((tj-370)/28))%2===0?"#2a2000":"#221a00";
      c.fillRect(ti,tj,29,27);
      c.strokeStyle="rgba(255,215,0,0.08)";c.lineWidth=0.5;c.strokeRect(ti,tj,29,27);
    }
    // Holy radiance from above
    var hr=0.3+0.15*Math.sin(frameTick*0.04);
    c.save();c.globalAlpha=hr;
    var hg=c.createRadialGradient(CW/2,-20,5,CW/2,-20,320);hg.addColorStop(0,"rgba(255,215,0,0.9)");hg.addColorStop(0.4,"rgba(255,180,0,0.3)");hg.addColorStop(1,"rgba(0,0,0,0)");
    c.fillStyle=hg;c.fillRect(0,0,CW,CH);c.restore();
    // Golden toilet silhouette
    c.fillStyle="rgba(180,140,0,0.5)";c.fillRect(280,310,55,55);c.fillRect(276,298,63,14);c.fillRect(282,286,50,14);
    // Space Jesus vs Devil painting on wall
    c.fillStyle="rgba(30,20,0,0.8)";c.fillRect(140,40,80,100);
    c.save();c.globalAlpha=0.5;c.fillStyle="#FFD700";c.font="5px monospace";c.textAlign="center";c.fillText("★ VS ★",180,95);c.textAlign="left";c.restore();
    // Pinup girl painting
    c.fillStyle="rgba(30,20,0,0.8)";c.fillRect(0,40,100,110);
    c.save();c.globalAlpha=0.4;c.fillStyle="#FF69B4";c.beginPath();c.ellipse(50,85,15,22,0,0,Math.PI*2);c.fill();c.restore();
    // Candle glow from sides
    [[10,220],[350,220]].forEach(function(cv){
      var cf=0.5+0.3*Math.sin(frameTick*0.1+cv[0]);
      c.save();c.globalAlpha=cf*0.3;var cg=c.createRadialGradient(cv[0],cv[1],1,cv[0],cv[1],55);cg.addColorStop(0,"rgba(255,200,50,0.9)");cg.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=cg;c.fillRect(cv[0]-55,cv[1]-55,110,110);c.restore();
    });
    // Frankincense smoke wisps
    for(var fi=0;fi<3;fi++){
      var fy=(frameTick*0.5+fi*70)%160;
      c.fillStyle="rgba(255,215,0,"+(Math.max(0,0.15-fy*0.001))+")";c.font="10px monospace";c.textAlign="center";
      c.fillText("~",20+fi*170,100+fy);c.textAlign="left";
    }
  } else {
    // Generic fallback
    var bg=c.createLinearGradient(0,0,0,CH);bg.addColorStop(0,"#0a0a2a");bg.addColorStop(0.5,"#1a0a3e");bg.addColorStop(1,"#0a0a1a");
    c.fillStyle=bg;c.fillRect(0,0,CW,CH);
    var fg=c.createLinearGradient(0,370,0,CH);fg.addColorStop(0,"#2a1a3e");fg.addColorStop(1,"#0a0a1a");
    c.fillStyle=fg;c.fillRect(0,370,CW,CH-370);
  }

  // Ambient glow behind fighters (tinted to fighter color)
  var pulse=0.5+0.5*Math.sin(frameTick*0.04);
  c.save();c.globalAlpha=0.06+0.03*pulse;
  c.fillStyle="#FF69B4";c.beginPath();c.arc(80,400,80,0,Math.PI*2);c.fill();
  var fr=parseInt((f.color||"#9966cc").slice(1,3),16),fg2=parseInt((f.color||"#9966cc").slice(3,5),16),fb2=parseInt((f.color||"#9966cc").slice(5,7),16);
  c.fillStyle="rgb("+fr+","+fg2+","+fb2+")";c.beginPath();c.arc(265,270,80,0,Math.PI*2);c.fill();
  c.restore();

  // Arena floor line
  c.strokeStyle="rgba(255,255,255,0.06)";c.lineWidth=1;c.beginPath();c.moveTo(0,370);c.lineTo(CW,370);c.stroke();

  // Enemy (top right, facing left)
  drawBattleEnemy(c,f,265,280,bs.enemyPose,bs.enemyActionTimer,bs.enemyAnim);
  // K'Dee (bottom left, facing right) — raised so full body is visible above action buttons
  drawBattleKdee(c,80,430,bs.kdeePose,bs.kdeeActionTimer);

  // Enemy heart containers (same system as K'Dee — each HP = 1 quarter)
  var ebx=170,eby=160;
  c.fillStyle="#fff";c.font="bold 11px monospace";c.fillText(f.name,ebx,eby-4);
  var eMaxHearts=Math.ceil(f.maxHp/4);
  for(var hi=0;hi<eMaxHearts;hi++){
    var hx2=ebx+(hi%5)*22,hy2=eby+2+Math.floor(hi/5)*18;
    var q=bs.enemyHP-hi*4;
    var hemoji=q>=4?"\u2764\uFE0F":q===3?"\uD83D\uDC97":q===2?"\uD83D\uDC9B":q===1?"\uD83E\uDDE1":"\uD83E\uDD0D";
    c.font="13px monospace";c.fillText(hemoji,hx2,hy2+12);
  }

  // K'Dee heart containers (Zelda-style)
  var kbx=20,kby=350;
  c.fillStyle="#fff";c.font="bold 10px monospace";c.fillText("K'DEE",kbx,kby-4);
  // Draw up to 10 containers in rows of 5
  for(var hi=0;hi<kdeeMaxHearts;hi++){
    var hx2=kbx+(hi%5)*22,hy2=kby+2+Math.floor(hi/5)*18;
    var q=kdeeHP-hi*4;
    var hemoji=q>=4?"\u2764\uFE0F":q===3?"\uD83D\uDC97":q===2?"\uD83D\uDC9B":q===1?"\uD83E\uDDE1":"\uD83E\uDD0D";
    c.font="13px monospace";c.fillText(hemoji,hx2,hy2+12);
  }
  if(kdeeHP<=0){c.fillStyle="rgba(139,0,0,0.7)";c.font="bold 9px monospace";c.fillText("RUNNING ON FUMES",kbx,kby+40);}
  else if(kdeeHP<=4){c.fillStyle="rgba(255,60,60,0.5)";c.font="bold 9px monospace";c.fillText("EXHAUSTED",kbx,kby+40);}

  // Screen flash
  if(bs.flashTimer>0){c.save();c.globalAlpha=bs.flashTimer/12*0.4;c.fillStyle=bs.flashColor;c.fillRect(0,0,CW,CH);c.restore();}

  // Floating damage numbers
  dmgFloats.forEach(function(df){
    if(df.life<=0)return;
    c.save();c.globalAlpha=Math.min(1,df.life/15);
    c.fillStyle=df.color;c.font="bold "+(16+Math.max(0,20-df.life)*0.6)+"px monospace";
    c.textAlign="center";c.fillText(df.txt,df.x,df.y);c.textAlign="left";
    c.restore();
    df.y-=1.2;df.life--;
  });

  // Message box — taller to fit larger text
  RR(c,10,508,CW-20,122,8,"rgba(0,0,0,0.92)");
  c.strokeStyle="rgba(255,215,0,0.3)";c.lineWidth=1.5;
  c.beginPath();
  var mbr=8,mbx=12,mby=510,mbw=CW-24,mbh=118;
  c.moveTo(mbx+mbr,mby);c.lineTo(mbx+mbw-mbr,mby);c.quadraticCurveTo(mbx+mbw,mby,mbx+mbw,mby+mbr);
  c.lineTo(mbx+mbw,mby+mbh-mbr);c.quadraticCurveTo(mbx+mbw,mby+mbh,mbx+mbw-mbr,mby+mbh);
  c.lineTo(mbx+mbr,mby+mbh);c.quadraticCurveTo(mbx,mby+mbh,mbx,mby+mbh-mbr);
  c.lineTo(mbx,mby+mbr);c.quadraticCurveTo(mbx,mby,mbx+mbr,mby);c.stroke();

  // Message text (word wrap with \n support) — larger font
  c.fillStyle="#eee";c.font="bold 12px monospace";
  var rawLines=(bs.msg||"").split("\n"),allLines=[];
  for(var ml=0;ml<rawLines.length;ml++){
    var words=rawLines[ml].split(" "),line="";
    for(var w=0;w<words.length;w++){
      var test=line+(line?" ":"")+words[w];
      if(c.measureText(test).width>CW-52){allLines.push(line);line=words[w];}else{line=test;}
    }
    if(line)allLines.push(line);else allLines.push("");
  }
  for(var l=0;l<Math.min(allLines.length,7);l++){c.fillText(allLines[l],22,530+l*15);}

  // Action buttons — above the message box
  if(bs.phase==="player"){
    var btnY=462;var btnH=34;
    var actions=[
      {label:"\u270B SLAP",color:"#e74c3c",x:12,w:76},
      {label:"\uD83D\uDCAC NAG",color:"#FF69B4",x:94,w:72},
      {label:"\uD83D\uDC5C PURSE",color:"#FFD700",x:172,w:80}
    ];
    actions.forEach(function(a){
      RR(c,a.x,btnY,a.w,btnH,6,a.color);
      c.fillStyle="rgba(0,0,0,0.25)";c.font="bold 11px monospace";c.fillText(a.label,a.x+9,btnY+23);
      c.fillStyle="#1a0a2e";c.font="bold 11px monospace";c.fillText(a.label,a.x+8,btnY+22);
    });
    // Big Hug for Milo, ITEM otherwise
    if(bs.id==="milo"||bs.id==="gwyneth"||bs.id==="forest"||bs.id==="daed"||bs.id==="jesus"||bs.id==="demon"){
      RR(c,258,btnY,92,btnH,6,"#FF69B4");
      c.fillStyle="rgba(0,0,0,0.25)";c.font="bold 11px monospace";c.fillText("\uD83E\uDD17 HUG",267,btnY+23);
      c.fillStyle="#1a0a2e";c.font="bold 11px monospace";c.fillText("\uD83E\uDD17 HUG",266,btnY+22);
    } else if(inv.length>0){
      RR(c,258,btnY,92,btnH,6,"#00CED1");
      c.fillStyle="rgba(0,0,0,0.25)";c.font="bold 11px monospace";c.fillText("\uD83C\uDF81 ITEM",267,btnY+23);
      c.fillStyle="#1a0a2e";c.font="bold 11px monospace";c.fillText("\uD83C\uDF81 ITEM",266,btnY+22);
    }
  }

  // Item selection overlay
  if(bs.phase==="items"){
    c.fillStyle="rgba(0,0,0,0.75)";c.fillRect(0,0,CW,CH);
    RR(c,15,130,CW-30,370,10,"#1a0a2e");
    c.strokeStyle=P.gold;c.lineWidth=2;
    c.strokeRect(17,132,CW-34,366);
    c.fillStyle=P.gold;c.font="bold 14px monospace";c.textAlign="center";
    c.fillText("USE WHICH ITEM?",CW/2,165);c.textAlign="left";
    for(var i=0;i<inv.length&&i<8;i++){
      var ix=30+(i%4)*80,iy=185+Math.floor(i/4)*85;
      var info=invDetails[inv[i]]||{emoji:invEmoji[inv[i]]||"\u2753",name:inv[i]};
      var isSE=f.itemEffects&&f.itemEffects[inv[i]]&&f.itemEffects[inv[i]].super;
      RR(c,ix,iy,70,72,6,isSE?"rgba(0,206,209,0.12)":"rgba(255,255,255,0.04)");
      c.strokeStyle=isSE?"#00CED1":"rgba(255,215,0,0.2)";c.lineWidth=isSE?2:1;c.strokeRect(ix+1,iy+1,68,70);
      if(isSE){
        c.fillStyle="rgba(0,206,209,0.08)";c.fillRect(ix+2,iy+2,66,68);
        c.fillStyle="#00CED1";c.font="bold 6px monospace";c.fillText("SUPER",ix+22,iy+68);
      }
      c.font="26px monospace";c.textAlign="center";c.fillText(info.emoji,ix+35,iy+35);c.textAlign="left";
      c.fillStyle="#ccc";c.font="7px monospace";
      var nm=(info.name||inv[i]);if(nm.length>10)nm=nm.substring(0,9)+"..";
      c.textAlign="center";c.fillText(nm,ix+35,iy+52);c.textAlign="left";
    }
    RR(c,125,460,110,30,6,"#CD5C5C");
    c.fillStyle="#fff";c.font="bold 10px monospace";c.textAlign="center";c.fillText("\u2190 BACK",CW/2,480);c.textAlign="left";
  }

  // Continue prompt (pulsing)
  if(bs.phase==="intro"||bs.phase==="enemyAct"||bs.phase==="victory"||bs.phase==="superCut"){
    var pp=0.3+0.3*Math.sin(frameTick*0.1);
    c.fillStyle="rgba(255,255,255,"+pp+")";c.font="bold 10px monospace";c.textAlign="center";
    c.fillText("[ TAP TO CONTINUE ]",CW/2,632);c.textAlign="left";
  }

  // === SUPER EFFECTIVE CUT-IN ===
  if(bs.phase==="superCut"){
    var sp=bs.superTimer||0;
    if(sp<20){
      // Dramatic black bars
      var barH=Math.min(80,sp*8);
      c.fillStyle="#000";c.fillRect(0,0,CW,barH);c.fillRect(0,CH-barH,CW,barH);
      // "SUPER EFFECTIVE!" text zooming in
      c.save();c.globalAlpha=Math.min(1,sp/8);
      var sz=20+sp*0.8;
      c.fillStyle="#00CED1";c.font="bold "+Math.floor(sz)+"px monospace";
      c.textAlign="center";c.fillText("SUPER",CW/2,CH/2-10);
      c.fillStyle=P.gold;c.fillText("EFFECTIVE!",CW/2,CH/2+20);
      c.textAlign="left";c.restore();
      // Sparkle particles
      for(var s=0;s<6;s++){
        var sa=s*Math.PI/3+sp*0.1;
        var sr=40+sp*2;
        c.fillStyle="rgba(0,206,209,"+(0.6-sp*0.02)+")";
        c.beginPath();c.arc(CW/2+Math.cos(sa)*sr,CH/2+Math.sin(sa)*sr,3,0,Math.PI*2);c.fill();
      }
    }
  }
}

/* ===== BATTLE CLICK HANDLER ===== */
function battleClick(mx,my){
  var bs=battleState;if(!bs)return;

  // VS intro — skip on tap
  if(bs.phase==="vsIntro"){bs.vsTimer=0;return;}

  // Intro text — advance lines
  if(bs.phase==="intro"){
    bs.introLine++;
    var lines=bs.fighter.intro;
    if(bs.introLine>=lines.length){
      bs.phase="player";bs.msg="What will K'Dee do?";
    }else{
      bs.msg=lines[bs.introLine];
    }
    return;
  }

  // Victory
  if(bs.phase==="victory"){
    var wasHug=bs.hugWin;var wasId=bs.id;
    battleActive=false;paused=false;battleDone[bs.id]=true;
    battleState=null;
    // Hug a kid = +1 heart container + full heal
    if(wasHug&&(wasId==="milo"||wasId==="gwyneth"||wasId==="forest"||wasId==="daed"||wasId==="jesus"||wasId==="demon")){
      if(kdeeMaxHearts<10)kdeeMaxHearts++;
      kdeeMaxHP=kdeeMaxHearts*4;
      kdeeHP=kdeeMaxHP;
    }
    updateHUD();
    if(wasHug&&wasId==="milo"){
      miloFollowing=true;miloRoomsLeft=3;
      miloFollowX=kdeeX+35;miloFollowY=kdeeY;
      miloMsg="'I love you mom!'";miloMsgTimer=120;
    }
    if(wasHug&&wasId==="gwyneth"){
      gwynFollowing=true;gwynRoomsLeft=3;
      gwynFollowX=kdeeX+40;gwynFollowY=kdeeY;
      gwynMsg="'*snore*'";gwynMsgTimer=120;
    }
    if(wasHug&&wasId==="forest"){
      livingRoomKids.forest=true;
      setDesc("Forest claimed the living room TV.");
    }
    if(wasId==="daed"){
      livingRoomKids.daed=true;
    }
    return;
  }

  // Super effective cut-in
  if(bs.phase==="superCut"){
    bs.phase="victory";bs.msg=bs.victoryMsg||"";return;
  }

  // After enemy attack
  if(bs.phase==="enemyAct"){
    bs.phase="player";bs.msg="What will K'Dee do?";
    bs.kdeePose="idle";bs.kdeeActionTimer=0;
    bs.enemyPose="idle";bs.enemyActionTimer=0;
    return;
  }

  // Item selection
  if(bs.phase==="items"){
    if(mx>=125&&mx<=235&&my>=460&&my<=490){bs.phase="player";bs.msg="What will K'Dee do?";return;}
    for(var i=0;i<inv.length&&i<8;i++){
      var ix=30+(i%4)*80,iy=185+Math.floor(i/4)*85;
      if(mx>=ix&&mx<=ix+70&&my>=iy&&my<=iy+72){useItemInBattle(inv[i]);return;}
    }
    return;
  }

  // Player turn
  if(bs.phase==="player"){
    var btnY=462,btnH=34;
    if(mx>=12&&mx<=88&&my>=btnY&&my<=btnY+btnH){
      var dmg=3+Math.floor(Math.random()*2);
      var quips=["K'Dee slaps "+bs.fighter.name+"! MOM POWER!","*SLAP* The mom hand is MIGHTY.","K'Dee's slap echoes through the house!","SLAP! "+bs.fighter.name+" didn't see that coming!"];
      doPlayerAttack("SLAP",dmg,rPick(quips),"slap");return;
    }
    if(mx>=94&&mx<=166&&my>=btnY&&my<=btnY+btnH){
      var dmg=2+Math.floor(Math.random()*2);
      var quips=["'...and ANOTHER thing!' Legendary mom-nag!","K'Dee deploys The Lecture. It's devastating.","'When I was YOUR age...' Critical hit!","'Do you think keys grow on TREES?!'"];
      doPlayerAttack("NAG",dmg,rPick(quips),"nag");return;
    }
    if(mx>=172&&mx<=252&&my>=btnY&&my<=btnY+btnH){
      var quips=["K'Dee swings her purse! It weighs 47 pounds!","PURSE STRIKE! Contains: everything. Weighs: too much.","The purse connects! It has bricks in it somehow!","*WHAM* That purse is a weapon of mass destruction."];
      doPlayerAttack("PURSE",4,rPick(quips),"purse");return;
    }
    if(mx>=258&&mx<=350&&my>=btnY&&my<=btnY+btnH){
      if(bs.id==="milo"){
        // Big Hug — instant win, Milo follows after
        bs.kdeePose="item";bs.kdeeActionTimer=1;
        bs.enemyHP=0;
        bs.msg="K'Dee scoops Milo up in a BIG HUG.\n\nHe immediately forgets everything.\n\n'...mom you smell like coffee.'\n'I know, baby.'\n\nMilo beams. Battle forgotten.";
        bs.phase="victory";bs.hugWin=true;
        bs.flashTimer=15;bs.flashColor="rgba(255,105,180,0.35)";
        addDmgFloat(265,290,"💗","#FF69B4");
        return;
      }
      if(bs.id==="gwyneth"){
        // Hug — Gwyneth wakes up just enough to hug back, then follows sleepily
        bs.kdeePose="item";bs.kdeeActionTimer=1;
        bs.enemyHP=0;
        bs.msg="K'Dee wraps Gwyneth in a hug.\n\nGwyneth's eyes open halfway.\n\n'...oh. hi mom.'\n\nShe hugs back with surprising grip.\n\n'...love you.' *immediately falls back asleep standing up*";
        bs.phase="victory";bs.hugWin=true;
        bs.flashTimer=15;bs.flashColor="rgba(65,105,225,0.3)";
        addDmgFloat(265,290,"💙","#4169E1");
        return;
      }
      if(bs.id==="forest"){
        // Hug — Forest emerges from bubble, goes to claim the TV
        bs.kdeePose="item";bs.kdeeActionTimer=1;
        bs.enemyHP=0;
        bs.msg="K'Dee knocks on the bubble.\n\n'Forest. Come out.'\n\nLong pause.\n\n*airlock hiss*\n\nForest emerges. He allows a hug. Brief. Firm.\n\n'...okay.' He picks up the TV remote.\n\n'I'm taking the living room.'";
        bs.phase="victory";bs.hugWin=true;
        bs.flashTimer=15;bs.flashColor="rgba(85,107,47,0.3)";
        addDmgFloat(265,290,"🎮","#556b2f");
        return;
      }
      if(bs.id==="daed"){
        bs.kdeePose="item";bs.kdeeActionTimer=1;
        bs.enemyHP=0;
        bs.msg="K'Dee opens her arms.\n\nDaed FREEZES.\n\nThen — full bear hug. ENORMOUS. The man commits.\n\n'I LOVE YOU MOM!' He spins her once.\n\nThen he's out the door.\n\nEngine revving before she finishes exhaling.";
        bs.phase="victory";bs.hugWin=true;
        bs.flashTimer=15;bs.flashColor="rgba(255,165,0,0.35)";
        addDmgFloat(265,290,"🧡","#FF8C00");
        return;
      }
      if(bs.id==="jesus"){
        bs.kdeePose="item";bs.kdeeActionTimer=1;
        bs.enemyHP=0;
        bs.msg="K'Dee opens her arms to Space Jesus.\n\nA long pause.\n\nHis halo flickers.\n\n'...I'm not going to do that.'\n\nAnother pause.\n\n'I am... not a hugger, K'Dee.'\n\n'Jesus.'\n\n'I will BLESS you instead.'\n\nHe puts two fingers to her forehead. She feels briefly wonderful.\n\nThe pinup girl slow-claps from her painting.";
        bs.phase="victory";bs.hugWin=true;
        bs.flashTimer=15;bs.flashColor="rgba(255,215,0,0.35)";
        addDmgFloat(265,290,"✨","#FFD700");
        return;
      }
      if(bs.id==="demon"){
        bs.kdeePose="item";bs.kdeeActionTimer=1;
        bs.enemyHP=0;
        bs.msg="K'Dee opens her arms.\n\nBaal'thazar stares.\n\n'...what are you doing.'\n\n'Come here.'\n\n'I am a DEMON OF—'\n\n'Come. Here.'\n\nA pause longer than the pentagram has existed.\n\n*very small awkward hug*\n\nHe immediately dissolves into a poof of...\n\n...cinnamon?\n\n'...tell no one.' The smoke smells like a Yankee Candle.\n\nThe basement feels weirdly cozy.";
        bs.phase="victory";bs.hugWin=true;
        bs.flashTimer=15;bs.flashColor="rgba(139,0,139,0.35)";
        addDmgFloat(265,290,"🕯️","#9B59B6");
        return;
      }
      if(inv.length>0){bs.phase="items";bs.msg="Choose an item to use...";return;}
    }
  }
}

function doPlayerAttack(name,dmg,msg,pose){
  var bs=battleState;
  // Gwyneth reduced damage
  if(bs.id==="gwyneth"){
    dmg=Math.max(0,dmg-1);
    msg+="\n...Gwyneth doesn't notice. She's asleep.";
  }
  bs.kdeePose=pose;bs.kdeeActionTimer=1;
  bs.enemyHP=Math.max(0,bs.enemyHP-dmg);
  bs.shakeTimer=12;
  bs.flashTimer=8;bs.flashColor="rgba(255,100,100,0.25)";
  addDmgFloat(265,290,dmg>0?"-"+dmg:"MISS",dmg>0?"#e74c3c":"#888");
  if(bs.enemyHP<=0){
    bs.msg=msg+"\n\n"+bs.fighter.defeat.join("\n");
    bs.phase="victory";
  }else{
    bs.msg=msg;bs.phase="enemyTurn";
    setTimeout(function(){enemyTurn();},900);
  }
}

function useItemInBattle(itemId){
  var bs=battleState;var f=bs.fighter;
  var eff=f.itemEffects&&f.itemEffects[itemId];
  bs.kdeePose="item";bs.kdeeActionTimer=1;
  if(eff){
    var dmg=eff.dmg||3;
    bs.enemyHP=Math.max(0,bs.enemyHP-dmg);
    bs.shakeTimer=14;bs.flashTimer=10;bs.flashColor="rgba(0,206,209,0.3)";
    addDmgFloat(265,280,"-"+dmg,eff.super?"#00CED1":"#FFD700");
    var emsg=eff.msg.join("\n");
    if(bs.enemyHP<=0){
      if(eff.super){
        bs.msg=emsg;bs.victoryMsg=emsg+"\n\n"+f.defeat.join("\n");
        bs.phase="superCut";bs.superTimer=0;
      }else{
        bs.msg=emsg+"\n\n"+f.defeat.join("\n");bs.phase="victory";
      }
    }else{
      bs.msg=emsg;bs.phase="enemyTurn";
      setTimeout(function(){enemyTurn();},900);
    }
  }else{
    var dmg=2;var info=invDetails[itemId]||{name:itemId};
    bs.enemyHP=Math.max(0,bs.enemyHP-dmg);
    bs.shakeTimer=8;bs.flashTimer=6;bs.flashColor="rgba(255,215,0,0.2)";
    addDmgFloat(265,290,"-"+dmg,"#FFD700");
    var msg="K'Dee uses "+info.name+"! "+f.name+" is confused.";
    if(bs.enemyHP<=0){bs.msg=msg+"\n\n"+f.defeat.join("\n");bs.phase="victory";}
    else{bs.msg=msg;bs.phase="enemyTurn";setTimeout(function(){enemyTurn();},900);}
  }
}

function enemyTurn(){
  var bs=battleState;if(!bs)return;
  var f=bs.fighter;
  if(bs.id==="daed"){bs.phase="victory";bs.msg=f.defeat.join("\n");return;}
  var atkIdx=Math.floor(Math.random()*f.attacks.length);
  var atk=f.attacks[atkIdx];
  var dmg=atk.dmg;
  var quip=rPick(atk.quips);
  kdeeHP-=dmg;
  bs.enemyPose="attack";bs.enemyActionTimer=1;
  if(dmg>0){
    bs.kdeePose="hurt";bs.kdeeActionTimer=1;
    bs.flashTimer=8;bs.flashColor="rgba(255,0,0,0.2)";
    addDmgFloat(150,410,"-"+dmg,"#e74c3c");
  }
  // Show attack name + quip
  bs.msg="[ "+atk.name+" ]\n"+quip;
  bs.phase="enemyAct";bs.turnCount++;updateHUD();
}

function addDmgFloat(x,y,txt,color){
  dmgFloats.push({x:x+Math.random()*20-10,y:y,txt:txt,color:color,life:30});
}

function updateBattle(){
  if(!battleState)return;
  battleState.kdeeAnim++;battleState.enemyAnim++;
  if(battleState.shakeTimer>0)battleState.shakeTimer--;
  if(battleState.flashTimer>0)battleState.flashTimer--;
  if(battleState.kdeeActionTimer>0){battleState.kdeeActionTimer++;if(battleState.kdeeActionTimer>20){battleState.kdeeActionTimer=0;if(battleState.kdeePose!=="hurt")battleState.kdeePose="idle";}}
  if(battleState.enemyActionTimer>0){battleState.enemyActionTimer++;if(battleState.enemyActionTimer>20){battleState.enemyActionTimer=0;battleState.enemyPose="idle";}}
  // VS intro timer
  if(battleState.phase==="vsIntro"){
    battleState.vsTimer--;
    if(battleState.vsTimer<=0){
      battleState.phase="intro";battleState.introLine=0;
      battleState.msg=battleState.fighter.intro[0];
    }
  }
  // Super cut timer
  if(battleState.phase==="superCut"){
    battleState.superTimer=(battleState.superTimer||0)+1;
  }
  // Clean up dead floats
  dmgFloats=dmgFloats.filter(function(d){return d.life>0;});
}

/* --- ENDLESS RACER MINI-GAME --- */
/* K'Dee drives the red Audi TT down the road after finding all 3 keys. */
var racerActive=false,racerX=180,racerSpeed=2.5,racerScore=0,racerDist=0;
var racerObstacles=[],racerLanes=[90,180,270];// 3 lane X centers
var racerLane=1,racerTargetX=180,racerScrollY=0,racerLives=3,racerOver=false;
var racerMsg="",racerMsgTimer=0,racerSpawnTimer=0,racerTick=0;
var RACER_ROAD_L=40,RACER_ROAD_R=320;// road edges

/* --- TETRIS (CLOTHES MOUNTAIN) MINI-GAME --- */
var tetActive=false,tetBoard=[],tetPiece=null,tetNext=null;
var tetScore=0,tetLines=0,tetLevel=1,tetOver=false,tetWon=false;
var tetTick=0,tetFallTimer=0,tetMsg="",tetMsgTimer=0;
var TET_COLS=7,TET_ROWS=14,TET_BOARD_X=14,TET_BOARD_Y=80;
var TET_CW=46,TET_CH=36,TET_TARGET_LINES=4;
var TET_PIECES=[
  {shape:[[1,1,1,1]],color:"#00CED1"},
  {shape:[[1,1],[1,1]],color:"#4169E1"},
  {shape:[[0,1,0],[1,1,1]],color:"#FF69B4"},
  {shape:[[0,1,1],[1,1,0]],color:"#FF8C00"},
  {shape:[[1,1,0],[0,1,1]],color:"#9b59b6"},
  {shape:[[1,0,0],[1,1,1]],color:"#e74c3c"},
  {shape:[[0,0,1],[1,1,1]],color:"#2ecc71"}
];

function startTetris(){
  tetBoard=[];
  for(var r=0;r<TET_ROWS;r++){tetBoard.push([]);for(var c=0;c<TET_COLS;c++)tetBoard[r].push(null);}
  // Pre-fill bottom 2 rows with random garbage
  for(var r=TET_ROWS-2;r<TET_ROWS;r++){
    for(var c=0;c<TET_COLS;c++){
      if(Math.random()>0.25)tetBoard[r][c]=TET_PIECES[Math.floor(Math.random()*TET_PIECES.length)].color;
    }
  }
  tetScore=0;tetLines=0;tetLevel=1;tetOver=false;tetWon=false;
  tetTick=0;tetFallTimer=0;tetMsg="STACK THE CLOTHES!";tetMsgTimer=100;
  tetNext=TET_PIECES[Math.floor(Math.random()*TET_PIECES.length)];
  spawnTetPiece();
  tetActive=true;paused=true;
}

function spawnTetPiece(){
  var def=tetNext||TET_PIECES[Math.floor(Math.random()*TET_PIECES.length)];
  tetNext=TET_PIECES[Math.floor(Math.random()*TET_PIECES.length)];
  var col=Math.floor((TET_COLS-def.shape[0].length)/2);
  tetPiece={shape:def.shape,color:def.color,row:0,col:col};
  // Check lose: spawns overlapping
  if(tetCollide(tetPiece,0,0)){
    tetOver=true;
    tetMsg="BURIED!";tetMsgTimer=180;
  }
}

function tetCollide(p,dr,dc){
  for(var r=0;r<p.shape.length;r++){
    for(var c=0;c<p.shape[r].length;c++){
      if(!p.shape[r][c])continue;
      var nr=p.row+r+dr,nc=p.col+c+dc;
      if(nr<0||nr>=TET_ROWS||nc<0||nc>=TET_COLS)return true;
      if(tetBoard[nr][nc])return true;
    }
  }
  return false;
}

function tetRotate(){
  if(!tetPiece||tetOver||tetWon)return;
  var s=tetPiece.shape;
  var rows=s.length,cols=s[0].length;
  var rot=[];
  for(var c=0;c<cols;c++){rot.push([]);for(var r=rows-1;r>=0;r--)rot[c].push(s[r][c]);}
  var orig=tetPiece.shape;
  tetPiece.shape=rot;
  // Wall kick
  if(tetCollide(tetPiece,0,0)){
    if(!tetCollide(tetPiece,0,1))tetPiece.col+=1;
    else if(!tetCollide(tetPiece,0,-1))tetPiece.col-=1;
    else if(!tetCollide(tetPiece,0,2))tetPiece.col+=2;
    else if(!tetCollide(tetPiece,0,-2))tetPiece.col-=2;
    else tetPiece.shape=orig;// revert
  }
}

function tetMoveH(dir){
  if(!tetPiece||tetOver||tetWon)return;
  if(!tetCollide(tetPiece,0,dir))tetPiece.col+=dir;
}

function tetDrop(){
  if(!tetPiece||tetOver||tetWon)return;
  if(!tetCollide(tetPiece,1,0)){tetPiece.row++;}
  else{tetLock();}
}

function tetHardDrop(){
  if(!tetPiece||tetOver||tetWon)return;
  while(!tetCollide(tetPiece,1,0))tetPiece.row++;
  tetLock();
}

function tetLock(){
  for(var r=0;r<tetPiece.shape.length;r++){
    for(var c=0;c<tetPiece.shape[r].length;c++){
      if(!tetPiece.shape[r][c])continue;
      var br=tetPiece.row+r,bc=tetPiece.col+c;
      if(br>=0&&br<TET_ROWS&&bc>=0&&bc<TET_COLS)tetBoard[br][bc]=tetPiece.color;
    }
  }
  tetClearLines();
  spawnTetPiece();
}

function tetClearLines(){
  var cleared=0;
  for(var r=TET_ROWS-1;r>=0;r--){
    var full=true;
    for(var c=0;c<TET_COLS;c++){if(!tetBoard[r][c]){full=false;break;}}
    if(full){
      tetBoard.splice(r,1);
      tetBoard.unshift([]);
      for(var c=0;c<TET_COLS;c++)tetBoard[0].push(null);
      cleared++;r++;// recheck same row index
    }
  }
  if(cleared>0){
    tetLines+=cleared;tetScore+=cleared*100*tetLevel;
    tetLevel=Math.min(10,1+Math.floor(tetLines/4));
    if(tetLines>=TET_TARGET_LINES&&!tetWon){
      tetWon=true;
      tetMsg="PHONE FOUND!";tetMsgTimer=200;
    }
  }
}

function tetGhostRow(){
  if(!tetPiece)return tetPiece?tetPiece.row:0;
  var gr=tetPiece.row;
  while(!tetCollide({shape:tetPiece.shape,color:tetPiece.color,row:gr+1,col:tetPiece.col},0,0))gr++;
  return gr;
}

function updateTetris(){
  tetTick++;
  if(tetMsgTimer>0)tetMsgTimer--;
  if(tetOver||tetWon){
    if(tetMsgTimer===0&&(tetOver||tetWon)){tetEndGame();}
    return;
  }
  tetFallTimer++;
  var fallInterval=Math.max(10,30-tetLevel*2);
  if(tetFallTimer>=fallInterval){tetFallTimer=0;tetDrop();}
}

function drawTetris(c){
  // Bedroom-tinted background
  c.fillStyle="#e8d0e0";c.fillRect(0,0,CW,CH);
  var bg=c.createLinearGradient(0,0,0,CH);
  bg.addColorStop(0,"#e8d0e0");bg.addColorStop(1,"#d4b0c0");
  c.fillStyle=bg;c.fillRect(0,0,CW,CH);

  // HUD bar
  c.fillStyle="rgba(0,0,0,0.75)";c.fillRect(0,0,CW,TET_BOARD_Y);
  c.fillStyle="#FFD700";c.font="bold 11px monospace";c.textAlign="center";
  c.fillText("CLOTHES MOUNTAIN",CW/2,16);c.textAlign="left";
  c.fillStyle="#fff";c.font="9px monospace";c.textAlign="center";
  c.fillText("LINES:"+tetLines+"/"+TET_TARGET_LINES+"  SCORE:"+tetScore+"  LVL:"+tetLevel,CW/2,35);c.textAlign="left";

  // Next piece preview label
  c.fillStyle="#ccc";c.font="7px monospace";c.fillText("NEXT:",TET_BOARD_X+TET_COLS*TET_CW+8,TET_BOARD_Y+14);
  if(tetNext){
    var nx=TET_BOARD_X+TET_COLS*TET_CW+8,ny=TET_BOARD_Y+18;
    for(var r=0;r<tetNext.shape.length;r++){
      for(var c2=0;c2<tetNext.shape[r].length;c2++){
        if(!tetNext.shape[r][c2])continue;
        RR(c,nx+c2*16,ny+r*14,14,12,2,tetNext.color);
      }
    }
  }

  // Board background
  c.fillStyle="rgba(0,0,0,0.35)";
  c.fillRect(TET_BOARD_X,TET_BOARD_Y,TET_COLS*TET_CW,TET_ROWS*TET_CH);

  // Phone peeking at bottom (under pre-fill zone)
  c.font="22px serif";c.textAlign="center";
  c.fillText("\uD83D\uDCF1",TET_BOARD_X+TET_COLS*TET_CW/2,TET_BOARD_Y+TET_ROWS*TET_CH+22);
  c.textAlign="left";c.font="7px monospace";c.fillStyle="rgba(255,255,255,0.5)";
  c.textAlign="center";c.fillText("*bzz*",TET_BOARD_X+TET_COLS*TET_CW/2,TET_BOARD_Y+TET_ROWS*TET_CH+34);c.textAlign="left";

  // Ghost piece
  if(tetPiece&&!tetOver&&!tetWon){
    var gr=tetGhostRow();
    for(var r=0;r<tetPiece.shape.length;r++){
      for(var c2=0;c2<tetPiece.shape[r].length;c2++){
        if(!tetPiece.shape[r][c2])continue;
        var bx=TET_BOARD_X+(tetPiece.col+c2)*TET_CW;
        var by=TET_BOARD_Y+(gr+r)*TET_CH;
        c.save();c.globalAlpha=0.25;
        RR(c,bx+1,by+1,TET_CW-2,TET_CH-2,3,tetPiece.color);
        c.restore();
      }
    }
  }

  // Locked cells
  for(var r=0;r<TET_ROWS;r++){
    for(var c2=0;c2<TET_COLS;c2++){
      if(!tetBoard[r][c2])continue;
      var bx=TET_BOARD_X+c2*TET_CW,by=TET_BOARD_Y+r*TET_CH;
      RR(c,bx+1,by+1,TET_CW-2,TET_CH-2,3,tetBoard[r][c2]);
      c.fillStyle="rgba(255,255,255,0.15)";
      c.fillRect(bx+2,by+2,TET_CW-10,4);
    }
  }

  // Active piece
  if(tetPiece&&!tetOver){
    for(var r=0;r<tetPiece.shape.length;r++){
      for(var c2=0;c2<tetPiece.shape[r].length;c2++){
        if(!tetPiece.shape[r][c2])continue;
        var bx=TET_BOARD_X+(tetPiece.col+c2)*TET_CW;
        var by=TET_BOARD_Y+(tetPiece.row+r)*TET_CH;
        RR(c,bx+1,by+1,TET_CW-2,TET_CH-2,3,tetPiece.color);
        c.fillStyle="rgba(255,255,255,0.25)";
        c.fillRect(bx+2,by+2,TET_CW-10,4);
      }
    }
  }

  // Board grid lines
  c.strokeStyle="rgba(255,255,255,0.06)";c.lineWidth=1;
  for(var r=0;r<=TET_ROWS;r++){c.beginPath();c.moveTo(TET_BOARD_X,TET_BOARD_Y+r*TET_CH);c.lineTo(TET_BOARD_X+TET_COLS*TET_CW,TET_BOARD_Y+r*TET_CH);c.stroke();}
  for(var c2=0;c2<=TET_COLS;c2++){c.beginPath();c.moveTo(TET_BOARD_X+c2*TET_CW,TET_BOARD_Y);c.lineTo(TET_BOARD_X+c2*TET_CW,TET_BOARD_Y+TET_ROWS*TET_CH);c.stroke();}

  // Message overlay
  if(tetMsgTimer>0&&tetMsg){
    var alpha=Math.min(1,tetMsgTimer/20);
    c.save();c.globalAlpha=alpha*0.95;
    c.font="bold 16px monospace";
    var tw=c.measureText(tetMsg).width+20;
    RR(c,CW/2-tw/2,CH/2-22,tw,32,6,"rgba(0,0,0,0.88)");
    c.fillStyle=tetWon?"#FFD700":"#e74c3c";
    c.textAlign="center";c.fillText(tetMsg,CW/2,CH/2+4);c.textAlign="left";
    c.restore();
  }

  // Controls hint
  c.fillStyle="rgba(255,255,255,0.3)";c.font="6px monospace";c.textAlign="center";
  c.fillText("\u2190\u2192 MOVE  \u2191 ROTATE  \u2193 DROP  SPACE=SLAM",CW/2,CH-6);c.textAlign="left";
}

function tetEndGame(){
  tetActive=false;paused=false;
  if(tetWon){
    // Mark clothespile as done (both verbs) so it can't be re-triggered
    usedHS[9+"_clothespile_push"]=true;
    usedHS[9+"_clothespile_take"]=true;
    inv.push("phone");questItems["phone"]=true;updateInv();
    showSimpleDlg("PHONE FOUND!","K'Dee digs through the avalanche... and there it is! 214 missed photos. 8% battery. 'I attached a photo' (no photo). The phone is FOUND.","phone");
  } else {
    kdeeHP=Math.max(1,kdeeHP-2);updateHUD(); // -2 quarters (half a heart)
    showSimpleDlg("BURIED!","The pile fought back. K'Dee emerges disheveled. The phone is still in there somewhere. Maybe try again?","hurt");
  }
}

function startRacer(){
  racerActive=true;racerX=180;racerLane=1;racerTargetX=180;racerSpeed=2.5;
  racerScore=0;racerDist=0;racerObstacles=[];racerLives=3;racerOver=false;
  racerMsg="JUST DRIVE.";racerMsgTimer=90;racerScrollY=0;racerTick=0;racerSpawnTimer=0;
  paused=true;
}

function updateRacer(){
  racerTick++;
  racerScrollY=(racerScrollY+racerSpeed*4)%80;
  racerDist+=racerSpeed;
  racerScore=Math.floor(racerDist/10);
  if(racerMsgTimer>0)racerMsgTimer--;

  // Speed creeps up forever — she can never outrun it
  if(racerTick%300===0&&racerSpeed<14)racerSpeed+=0.3;

  // Smooth K'Dee car toward target lane
  racerX+=(racerTargetX-racerX)*0.18;

  // Spawn obstacles
  racerSpawnTimer--;
  if(racerSpawnTimer<=0){
    var spd=racerSpeed*3+(Math.random()-0.5);
    var laneIdx=Math.floor(Math.random()*3);
    var type=Math.random()<0.3?"pothole":"car";
    racerObstacles.push({x:racerLanes[laneIdx],y:-30,speed:spd,type:type,lane:laneIdx,hit:false});
    racerSpawnTimer=Math.max(30,80-racerScore*0.5);
    if(Math.random()<0.3&&racerScore>20){
      var l2=(laneIdx+1+Math.floor(Math.random()*2))%3;
      racerObstacles.push({x:racerLanes[l2],y:-60,speed:spd,type:"pothole",lane:l2,hit:false});
    }
  }

  // Move obstacles
  racerObstacles.forEach(function(o){o.y+=o.speed;});
  racerObstacles=racerObstacles.filter(function(o){return o.y<680&&!o.hit;});

  // Collision — lose a life but NEVER end the game. She drives forever.
  racerObstacles.forEach(function(o){
    if(o.hit)return;
    if(o.y>510&&o.y<620&&Math.abs(o.x-racerX)<30){
      o.hit=true;
      if(racerLives>1){
        racerLives--;
        racerMsg="OOF! "+racerLives+" \u2665";racerMsgTimer=80;
      } else {
        // Bottom out at 1 life — she keeps going regardless
        racerMsg="SHE KEEPS GOING.";racerMsgTimer=90;
      }
    }
  });
}

function drawRacer(c){
  // Full-canvas road with perspective vanishing point at center-top
  var vx=CW/2,vy=60;// vanishing point
  var rl=RACER_ROAD_L,rr=RACER_ROAD_R;

  // Sky — just a thin strip above the vanishing point
  c.fillStyle="#87CEEB";c.fillRect(0,0,CW,vy);

  // Grass either side, full height below vanishing point
  c.fillStyle="#4a8a30";c.fillRect(0,vy,CW,CH-vy);

  // Road trapezoid — narrow at horizon, full width at bottom
  c.fillStyle="#666";
  c.beginPath();
  c.moveTo(vx-2,vy);c.lineTo(vx+2,vy);// vanishing point (tiny)
  c.lineTo(rr,CH);c.lineTo(rl,CH);
  c.closePath();c.fill();

  // Road gradient overlay for depth
  var roadGrad=c.createLinearGradient(0,vy,0,CH);
  roadGrad.addColorStop(0,"rgba(80,80,80,0.6)");roadGrad.addColorStop(1,"rgba(0,0,0,0)");
  c.fillStyle=roadGrad;
  c.beginPath();
  c.moveTo(vx-2,vy);c.lineTo(vx+2,vy);
  c.lineTo(rr,CH);c.lineTo(rl,CH);
  c.closePath();c.fill();

  // Road edge lines (perspective)
  c.strokeStyle="rgba(255,255,255,0.85)";c.lineWidth=2;c.setLineDash([]);
  c.beginPath();c.moveTo(vx,vy);c.lineTo(rl,CH);c.stroke();
  c.beginPath();c.moveTo(vx,vy);c.lineTo(rr,CH);c.stroke();

  // Lane dashes — perspective-correct, scrolling
  // Two lane dividers, lerped from vanishing point to road bottom
  [0.38,0.62].forEach(function(t){
    var lx1=vx,ly1=vy;
    var lx2=rl+(rr-rl)*t,ly2=CH;
    c.strokeStyle="rgba(255,255,255,0.55)";c.lineWidth=2;
    c.setLineDash([28,18]);c.lineDashOffset=-racerScrollY*2.5;
    c.beginPath();c.moveTo(lx1,ly1);c.lineTo(lx2,ly2);c.stroke();
  });
  c.setLineDash([]);

  // Scrolling tree silhouettes on horizon for movement sense
  var treeSpacing=60;
  for(var ti=0;ti<7;ti++){
    var tx=((ti*treeSpacing - racerScrollY*1.2)%420+420)%420 - 10;
    // Left trees
    c.fillStyle="#2d6a1a";
    c.beginPath();c.moveTo(tx,vy+30);c.lineTo(tx+10,vy+10);c.lineTo(tx+20,vy+30);c.closePath();c.fill();
    c.fillRect(tx+7,vy+30,6,20);
    // Right trees (mirror)
    var tx2=CW-tx-20;
    c.beginPath();c.moveTo(tx2,vy+30);c.lineTo(tx2+10,vy+10);c.lineTo(tx2+20,vy+30);c.closePath();c.fill();
    c.fillRect(tx2+7,vy+30,6,20);
  }

  // Obstacles
  racerObstacles.forEach(function(o){
    if(o.type==="pothole"){
      c.save();c.globalAlpha=0.9;
      c.fillStyle="#333";c.beginPath();c.ellipse(o.x,o.y,18,10,0,0,Math.PI*2);c.fill();
      c.fillStyle="#222";c.beginPath();c.ellipse(o.x,o.y,12,6,0,0,Math.PI*2);c.fill();
      c.restore();
    } else {
      drawRacerCar(c,o.x,o.y,"#3333cc",false);
    }
  });

  // K'Dee's red Audi TT convertible
  drawRacerCar(c,racerX,560,"#e74c3c",true);

  // HUD bar
  c.fillStyle="rgba(0,0,0,0.7)";c.fillRect(0,0,CW,48);
  c.fillStyle="#FFD700";c.font="bold 11px monospace";c.textAlign="center";
  c.fillText("JUST DRIVE.",CW/2,16);c.textAlign="left";
  c.fillStyle="#fff";c.font="10px monospace";c.textAlign="center";
  c.fillText(racerScore+"m escaped   \u2665"+racerLives+"   SPD: "+racerSpeed.toFixed(1)+"x",CW/2,34);c.textAlign="left";

  // Speed lines at high speed
  if(racerSpeed>5){
    var sl=Math.floor((racerSpeed-5)*4);
    c.save();c.globalAlpha=0.1;c.strokeStyle="#fff";c.lineWidth=1;
    for(var i=0;i<sl;i++){
      var sx=rl+Math.random()*(rr-rl);
      c.beginPath();c.moveTo(sx,vy);c.lineTo(sx-20,CH);c.stroke();
    }
    c.restore();
  }

  // Message overlay
  if(racerMsgTimer>0&&racerMsg){
    var alpha=Math.min(1,racerMsgTimer/20);
    c.save();c.globalAlpha=alpha*0.92;
    c.font="bold 13px monospace";
    var tw=c.measureText(racerMsg).width+20;
    RR(c,CW/2-tw/2,CH/2-26,tw,28,6,"rgba(0,0,0,0.85)");
    c.fillStyle="#FFD700";c.textAlign="center";
    c.fillText(racerMsg,CW/2,CH/2-6);c.textAlign="left";
    c.restore();
  }
}

function drawRacerCar(c,x,y,color,isKdee){
  // Car body
  c.save();c.translate(x,y);
  var w=28,h=44;
  // Shadow
  c.save();c.globalAlpha=0.2;c.fillStyle="#000";
  c.beginPath();c.ellipse(0,h/2+4,w/2+2,5,0,0,Math.PI*2);c.fill();c.restore();
  // Main body
  RR(c,-w/2,-h/2,w,h,5,color);
  // Windshield
  c.fillStyle="rgba(180,220,255,0.7)";
  RR(c,-w/2+4,-h/2+6,w-8,h*0.3,3,"rgba(180,220,255,0.7)");
  // Wheels
  c.fillStyle="#222";
  c.beginPath();c.ellipse(-w/2+1,-h/2+10,5,4,0,0,Math.PI*2);c.fill();
  c.beginPath();c.ellipse(w/2-1,-h/2+10,5,4,0,0,Math.PI*2);c.fill();
  c.beginPath();c.ellipse(-w/2+1,h/2-10,5,4,0,0,Math.PI*2);c.fill();
  c.beginPath();c.ellipse(w/2-1,h/2-10,5,4,0,0,Math.PI*2);c.fill();
  // Headlights/tail lights
  if(isKdee){
    // Tail lights (top of car since going away = rear)
    c.fillStyle="#e74c3c";c.fillRect(-w/2+2,-h/2,7,4);c.fillRect(w/2-9,-h/2,7,4);
    // K'Dee driver (small head in windshield)
    c.fillStyle=P.skin;c.beginPath();c.arc(0,-h/2+11,4,0,Math.PI*2);c.fill();
    c.fillStyle=P.hair;c.beginPath();c.arc(0,-h/2+8,4,Math.PI,2*Math.PI);c.fill();
  } else {
    c.fillStyle="#FFD700";c.fillRect(-w/2+2,h/2-4,7,4);c.fillRect(w/2-9,h/2-4,7,4);
  }
  c.restore();
}

// Racer touch input: swipe left/right or tap left/right half
var racerSwipeStart=null;
canvas.addEventListener("touchstart",function(e){
  if(!racerActive)return;
  var p=getCanvasCoords(e);racerSwipeStart={x:p.x,y:p.y};
},{passive:false});
canvas.addEventListener("touchend",function(e){
  if(!racerActive)return;
  e.preventDefault();
  if(!racerSwipeStart)return;
  var p=getCanvasCoords(e);
  var dx=p.x-racerSwipeStart.x;
  racerSwipeStart=null;
  if(Math.abs(dx)<15){// tap: left or right half
    if(p.x<CW/2)racerLaneMoveBy(-1);else racerLaneMoveBy(1);
  } else {
    if(dx<0)racerLaneMoveBy(-1);else racerLaneMoveBy(1);
  }
},{passive:false});

document.addEventListener("keydown",function(e){
  if(!racerActive)return;
  if(e.key==="ArrowLeft"||e.key==="a")racerLaneMoveBy(-1);
  else if(e.key==="ArrowRight"||e.key==="d")racerLaneMoveBy(1);
});

// Tetris touch input
var tetSwipeStart=null;
canvas.addEventListener("touchstart",function(e){
  if(!tetActive)return;
  var p=getCanvasCoords(e);tetSwipeStart={x:p.x,y:p.y};
},{passive:false});
canvas.addEventListener("touchend",function(e){
  if(!tetActive)return;
  e.preventDefault();
  if(tetOver||tetWon){tetEndGame();return;}
  if(!tetSwipeStart)return;
  var p=getCanvasCoords(e);
  var dx=p.x-tetSwipeStart.x,dy=p.y-tetSwipeStart.y;
  tetSwipeStart=null;
  if(Math.abs(dx)<12&&Math.abs(dy)<12){tetRotate();return;}
  if(Math.abs(dy)>Math.abs(dx)&&dy>20){tetHardDrop();return;}
  if(Math.abs(dx)>15){if(dx<0)tetMoveH(-1);else tetMoveH(1);}
},{passive:false});

document.addEventListener("keydown",function(e){
  if(!tetActive)return;
  if(e.key==="ArrowLeft")tetMoveH(-1);
  else if(e.key==="ArrowRight")tetMoveH(1);
  else if(e.key==="ArrowDown")tetDrop();
  else if(e.key==="ArrowUp"||e.key==="z"||e.key==="Z")tetRotate();
  else if(e.key===" ")tetHardDrop();
  else if(e.key==="Enter"&&(tetOver||tetWon))tetEndGame();
});

function racerLaneMoveBy(dir){
  racerLane=Math.max(0,Math.min(2,racerLane+dir));
  racerTargetX=racerLanes[racerLane];
}

function racerFinish(){
  racerActive=false;paused=false;
  var msg;
  if(racerLives>0){
    msg="K'Dee floors it home in the red Audi TT! "+racerScore+"m without crashing! She has arrived. Have fun, don't die!";
  } else {
    msg="K'Dee's TT is dented. Worth it. She got home eventually. "+racerScore+"m driven.";
  }
  gameOver=true;clearInterval(timerInterval);
  var d=document.getElementById("dlg");var inner=document.getElementById("dlg-inner");
  d.classList.remove("on");inner.style.animation="none";void inner.offsetWidth;inner.style.animation="";d.classList.add("on");
  setPortraitMode("excited");
  document.getElementById("dlg-name").textContent="HOME FREE!";
  typeText(document.getElementById("dlg-text"),msg);
  document.getElementById("dlg-choices").innerHTML='<div class="dlg-ch" id="play-again3" style="border-color:#FFD700;color:#FFD700">\uD83C\uDF89 PLAY AGAIN</div>';
  document.getElementById("play-again3").addEventListener("click",function(){location.reload();});
}


function winGame(){
  clearSave();
  gameOver=true;paused=true;clearInterval(timerInterval);
  document.getElementById("dlg-continue").style.display="none";
  var d=document.getElementById("dlg");
  var inner=document.getElementById("dlg-inner");
  d.classList.remove("on");inner.style.animation="none";
  void inner.offsetWidth;inner.style.animation="";d.classList.add("on");
  // Check for secret movie night ending
  var lrk=livingRoomKids;
  var allKids=lrk.milo&&lrk.greyson&&lrk.gwyneth&&lrk.forest&&lrk.daed&&lrk.holly;
  if(allKids){
    setPortraitMode("excited");
    document.getElementById("dlg-name").textContent="✨ MOVIE NIGHT";
    typeText(document.getElementById("dlg-text"),"K'Dee has her keys. She has her purse. She has her whole route planned.\n\nShe walks to the door.\n\nFrom the living room: TV sounds. Milo laughing. Gwyneth snoring. Forest typing. Greyson scientifically critiquing the film. Holly lurking tall and content in the corner. Daed asleep on the floor with the remote.\n\nK'Dee looks at the door.\n\nShe puts down her keys.\n\n'...okay. One movie.'\n\nShe never makes it to the car.");
    document.getElementById("dlg-choices").innerHTML=
      '<div class="dlg-ch" id="movie-night-btn" style="border-color:#FFD700;color:#FFD700">🎬 STAY HOME.</div>'+
      '<div class="dlg-ch" id="play-again-secret" style="border-color:#aaa;color:#aaa">🎉 PLAY AGAIN</div>';
    document.getElementById("movie-night-btn").addEventListener("click",function(){
      document.getElementById("dlg-name").textContent="THE END";
      typeText(document.getElementById("dlg-text"),"They watch two movies and half of a third.\n\nMilo falls asleep on K'Dee's shoulder.\nGreyson takes detailed notes on the science errors.\nGwyneth wakes up for exactly four minutes and cries at the dog scene.\nForest pauses it during 'the best part' three times to get snacks.\nDaed stays asleep through everything.\nHolly watches in complete silence from behind the couch.\n\nKdee doesn't move.\n\nShe earned this.");
      document.getElementById("dlg-choices").innerHTML='<div class="dlg-ch" id="play-again-end" style="border-color:#FFD700;color:#FFD700">🎉 PLAY AGAIN</div>';
      document.getElementById("play-again-end").addEventListener("click",function(){location.reload();});
    });
    document.getElementById("play-again-secret").addEventListener("click",function(){location.reload();});
    return;
  }
  setPortraitMode("excited");
  document.getElementById("dlg-name").textContent="YOU WIN!";
  var m=Math.floor((780-timer)/60),s=(780-timer)%60;
  typeText(document.getElementById("dlg-text"),"K'Dee found all 3 keys in "+m+"m "+s+"s! She grabs her purse, does NOT kiss the kids, and sprints for the red Audi TT. She's earned this. She drives. And drives. And drives.");
  document.getElementById("dlg-choices").innerHTML=
    '<div class="dlg-ch" id="drive-home-btn" style="border-color:#e74c3c;color:#e74c3c">\uD83D\uDE97 JUST DRIVE.</div>'+
    '<div class="dlg-ch" id="play-again" style="border-color:#FFD700;color:#FFD700">\uD83C\uDF89 PLAY AGAIN</div>';
  document.getElementById("drive-home-btn").addEventListener("click",function(){
    document.getElementById("dlg").classList.remove("on");
    gameOver=false;paused=false;
    startRacer();
  });
  document.getElementById("play-again").addEventListener("click",function(){location.reload();});
}

function loseGame(){
  clearSave();
  gameOver=true;paused=true;clearInterval(timerInterval);
  document.getElementById("dlg-continue").style.display="none";
  var d=document.getElementById("dlg");
  var inner=document.getElementById("dlg-inner");
  d.classList.remove("on");inner.style.animation="none";
  void inner.offsetWidth;inner.style.animation="";d.classList.add("on");
  setPortraitMode("hurt");
  document.getElementById("dlg-name").textContent="TIME'S UP!";
  typeText(document.getElementById("dlg-text"),"K'Dee is officially late. The kids are feral. The neighbor's cat is judging everyone through the window. "+keys+"/3 keys found. Try again?");
  document.getElementById("dlg-choices").innerHTML='<div class="dlg-ch" id="play-again2" style="border-color:#CD5C5C;color:#CD5C5C">\u23F0 TRY AGAIN</div>';
  document.getElementById("play-again2").addEventListener("click",function(){location.reload();});
}

var timerInterval;
function startTimer(){timerInterval=setInterval(function(){if(paused||gameOver)return;timer--;updateHUD();if(timer<=0){clearInterval(timerInterval);loseGame();}},1000);}

/* ── SAVE / LOAD ─────────────────────────────── */
var SAVE_KEY="kdeemom_save";
function saveGame(){
  try{
    localStorage.setItem(SAVE_KEY,JSON.stringify({
      curRoom:curRoom,keys:keys,timer:timer,
      inv:inv,usedHS:usedHS,questItems:questItems,
      kdeeHP:kdeeHP,kdeeMaxHP:kdeeMaxHP,kdeeHearts:kdeeHearts,kdeeMaxHearts:kdeeMaxHearts,
      kdeeX:Math.round(kdeeX),kdeeY:Math.round(kdeeY),
      battleDone:battleDone,
      livingRoomKids:livingRoomKids,hollyWasTripped:hollyWasTripped
    }));
  }catch(e){}
}
function loadGame(){
  try{
    var raw=localStorage.getItem(SAVE_KEY);
    if(!raw)return false;
    var s=JSON.parse(raw);
    curRoom=s.curRoom||0;keys=s.keys||0;timer=s.timer!=null?s.timer:780;
    inv=s.inv||[];usedHS=s.usedHS||{};questItems=s.questItems||{};
    kdeeHP=s.kdeeHP||16;kdeeMaxHP=s.kdeeMaxHP||16;
    kdeeHearts=s.kdeeHearts||4;kdeeMaxHearts=s.kdeeMaxHearts||4;
    kdeeX=s.kdeeX||180;kdeeY=s.kdeeY||520;
    kdeeTargetX=kdeeX;kdeeTargetY=kdeeY;
    if(s.battleDone)for(var k2 in s.battleDone)battleDone[k2]=s.battleDone[k2];
    if(s.livingRoomKids)for(var k3 in s.livingRoomKids)livingRoomKids[k3]=s.livingRoomKids[k3];
    hollyWasTripped=s.hollyWasTripped||false;
    return true;
  }catch(e){return false;}
}
function clearSave(){try{localStorage.removeItem(SAVE_KEY);}catch(e){}}
function hasSave(){try{return!!localStorage.getItem(SAVE_KEY);}catch(e){return false;}}

document.getElementById("startbtn").addEventListener("click",function(){
  clearSave();
  document.getElementById("title").style.display="none";
  document.getElementById("game").classList.add("on");
  kdeeX=180;kdeeY=520;// start center of foyer above welcome mat
  spawnParticles(curRoom);
  drawScene();updateHUD();
  initPortrait();
  startLoop();startTimer();
});

// Wire continue button (shown if save exists)
(function(){
  var cb=document.getElementById("contbtn");
  if(cb&&hasSave()){
    cb.style.display="";
    cb.addEventListener("click",function(){
      if(loadGame()){
        document.getElementById("title").style.display="none";
        document.getElementById("game").classList.add("on");
        hotspots=makeHS();
        spawnParticles(curRoom);
        drawScene();updateHUD();updateInv();
        initPortrait();
        startLoop();startTimer();
      }
    });
  }
})();

document.getElementById("pausebtn").addEventListener("click",function(){
  if(gameOver||battleActive||miniActive||frogActive||racerActive||tetActive||digActive||hollyMetaActive||sockSortActive||gwynSneakActive)return;
  paused=!paused;
  document.getElementById("pausebtn").textContent=paused?"▶":"⏸";
  if(paused){saveGame();setDesc("— PAUSED — tap anywhere to resume");}
  else{setDesc("What should K'Dee do?");}
});

document.getElementById("qbtn").addEventListener("click",function(){
  if(confirm("Quit game? Progress will be saved.")){
    saveGame();
    gameOver=true;animRunning=false;clearInterval(timerInterval);
    document.getElementById("game").classList.remove("on");
    var t=document.getElementById("title");
    t.style.display="flex";
    var cb=document.getElementById("contbtn");
    if(cb)cb.style.display="";
  }
});

})();
