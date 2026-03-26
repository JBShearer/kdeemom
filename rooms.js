/* K'DEE MOM - NATIVE PORTRAIT ROOM PAINTERS (360x640) */
var P={black:"#0a0a1a",dblue:"#1a0a2e",brown:"#5c3a1e",dbrown:"#3d2b1f",tan:"#c9a56c",pink:"#FF69B4",lpink:"#FFB6C1",gold:"#FFD700",yellow:"#FFEC8B",orange:"#FF8C00",teal:"#00CED1",sky:"#87CEEB",green:"#228B22",lgreen:"#90EE90",dgreen:"#006400",red:"#CD5C5C",dred:"#8B0000",gray:"#888",lgray:"#bbb",dgray:"#444",white:"#f0f0f0",purple:"#9B59B6",carpet:"#6B2D5B",wall1:"#4a3f5c",wall2:"#3d3450",skin:"#FDBCB4",hair:"#F0E68C",eye:"#00AA44"};
function D(c,x,y,w,h,f){c.fillStyle=f;c.fillRect(x,y,w,h);}
function rI(n){return Math.floor(Math.random()*n);}
/* Rounded rect helper */
function RR(c,x,y,w,h,r,f){c.fillStyle=f;c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();c.fill();}
/* Shadow under objects */
function SH(c,x,y,w){c.save();c.globalAlpha=0.12;c.fillStyle="#000";c.beginPath();c.ellipse(x+w/2,y,w/2,4,0,0,Math.PI*2);c.fill();c.restore();}
/* Wall-floor shadow line */
function WF(c,y){var g=c.createLinearGradient(0,y-6,0,y+6);g.addColorStop(0,"rgba(0,0,0,0.18)");g.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=g;c.fillRect(0,y-2,360,12);}

function paintFoyer(c){
  D(c,0,370,360,270,P.carpet);for(var i=0;i<360;i+=30)D(c,i,370,1,270,"rgba(0,0,0,0.06)");
  // Carpet pattern
  for(var j=380;j<640;j+=40)for(var i=10;i<350;i+=40){c.fillStyle="rgba(100,30,70,0.08)";c.beginPath();c.arc(i+20,j+20,8,0,Math.PI*2);c.fill();}
  var g=c.createLinearGradient(0,0,0,370);g.addColorStop(0,P.wall1);g.addColorStop(1,P.wall2);c.fillStyle=g;c.fillRect(0,0,360,370);
  // Wainscoting
  D(c,0,280,360,90,"rgba(50,30,60,0.3)");D(c,0,278,360,3,P.brown);
  D(c,0,330,360,40,P.dbrown);D(c,0,328,360,3,P.brown);
  WF(c,370);
  // Front door with arch
  D(c,120,60,120,280,P.dbrown);RR(c,125,65,110,270,4,"#654321");
  c.fillStyle="rgba(0,0,0,0.15)";c.beginPath();c.arc(180,65,55,Math.PI,2*Math.PI);c.fill();
  D(c,213,190,10,10,P.gold);c.fillStyle="#b8960c";c.beginPath();c.arc(218,195,4,0,Math.PI*2);c.fill();
  // Side passages with depth gradient
  D(c,8,120,65,220,P.dbrown);var pg=c.createLinearGradient(12,0,69,0);pg.addColorStop(0,"#1a1a1a");pg.addColorStop(1,P.brown);c.fillStyle=pg;c.fillRect(12,125,57,210);
  D(c,287,120,65,220,P.dbrown);pg=c.createLinearGradient(291,0,348,0);pg.addColorStop(0,P.brown);pg.addColorStop(1,"#1a1a1a");c.fillStyle=pg;c.fillRect(291,125,57,210);
  // Clock
  c.fillStyle=P.gold;c.beginPath();c.arc(180,22,14,0,Math.PI*2);c.fill();
  c.fillStyle="#1a0a2e";c.beginPath();c.arc(180,22,11,0,Math.PI*2);c.fill();
  c.strokeStyle=P.gold;c.lineWidth=1;c.beginPath();c.moveTo(180,22);c.lineTo(180,14);c.moveTo(180,22);c.lineTo(187,22);c.stroke();
  // Welcome mat
  RR(c,140,480,80,22,4,P.dgreen);c.fillStyle=P.lgreen;c.font="bold 7px monospace";c.fillText("WELCOME",149,496);
  // Shoe pile with scattered shoes
  D(c,260,440,60,30,"#4a3553");
  [[265,435,"#e74c3c"],[282,437,"#3498db"],[298,439,"#2ecc71"],[270,450,"#9b59b6"]].forEach(function(s){RR(c,s[0],s[1],14,9,3,s[2]);});
  // Coat rack
  D(c,85,160,5,170,P.dbrown);D(c,73,155,30,6,P.dbrown);RR(c,70,141,14,20,3,"#e74c3c");RR(c,88,138,14,22,3,"#3498db");
  // Mirror on LEFT wall (near coat rack, clear of door)
  RR(c,15,140,42,55,4,"#c0c0c0");RR(c,18,143,36,49,3,P.sky);
  c.fillStyle="rgba(255,255,255,0.12)";c.fillRect(18,143,11,49);
  D(c,26,155,18,22,P.skin);
  // Plant
  D(c,300,380,35,45,P.brown);SH(c,295,427,45);
  c.fillStyle=P.green;c.beginPath();c.arc(317,355,22,0,Math.PI*2);c.fill();
  c.fillStyle=P.lgreen;c.beginPath();c.arc(310,345,15,0,Math.PI*2);c.fill();
  c.fillStyle=P.lgreen;c.beginPath();c.arc(325,348,12,0,Math.PI*2);c.fill();
  // Downstairs steps at center bottom
  var sx=140,sy=510;
  D(c,sx,sy+36,80,10,P.dbrown);// shadow opening
  c.fillStyle="#0a0a0a";c.beginPath();c.ellipse(sx+40,sy+42,30,8,0,0,Math.PI*2);c.fill();
  for(var st=0;st<4;st++){var sw=80-st*10,sxo=sx+st*5,syo=sy+st*9;D(c,sxo,syo,sw,9,st%2===0?"#654321":"#7a6040");}
  // Banister posts on stairs
  c.fillStyle=P.dbrown;
  D(c,sx+4,sy,3,36,"#8B6914");D(c,sx+76,sy,3,36,"#8B6914");
  c.strokeStyle="#8B6914";c.lineWidth=2;c.beginPath();c.moveTo(sx+4,sy+2);c.lineTo(sx+76,sy+2);c.stroke();
  // Upstairs staircase on right side of foyer
  var usx=285,usy=200;
  // Wall opening arch
  D(c,usx,usy,65,160,P.dbrown);RR(c,usx+2,usy+2,61,158,6,"#3a2a14");
  // Steps going up (perspective — narrower at top)
  var stepColors=["#7a6040","#654321","#7a6040","#654321","#7a6040"];
  for(var us=0;us<5;us++){var uw=55-us*5,uxo=usx+5+us*3,uyo=usy+130-us*26;D(c,uxo,uyo,uw,10,stepColors[us]);}
  // Up-stair banister
  c.strokeStyle="#8B6914";c.lineWidth=2;
  c.beginPath();c.moveTo(usx+8,usy+140);c.lineTo(usx+20,usy+14);c.stroke();
  c.beginPath();c.moveTo(usx+54,usy+140);c.lineTo(usx+60,usy+14);c.stroke();
  // Label
  c.fillStyle="rgba(255,215,0,0.5)";c.font="bold 6px monospace";c.textAlign="center";
  c.fillText("UPSTAIRS",usx+32,usy+155);c.textAlign="left";
}
function paintKitchen(c){
  D(c,0,370,360,270,"#d4a76a");for(var i=0;i<360;i+=28)for(var j=370;j<640;j+=28){if((Math.floor(i/28)+Math.floor(j/28))%2===0)D(c,i,j,28,28,"#c99a5b");}
  var g=c.createLinearGradient(0,0,0,370);g.addColorStop(0,"#f5e6d3");g.addColorStop(1,"#e8d5b7");c.fillStyle=g;c.fillRect(0,0,360,370);
  WF(c,370);
  // Cabinets with handles and shadow
  for(var i=0;i<4;i++){RR(c,10+i*87,20,78,75,4,P.dbrown);RR(c,14+i*87,24,70,67,3,P.brown);
  c.fillStyle=P.gold;c.beginPath();c.arc(49+i*87,55,3,0,Math.PI*2);c.fill();}
  // Counter with depth
  var cg=c.createLinearGradient(0,268,0,305);cg.addColorStop(0,"#aaa");cg.addColorStop(1,"#777");c.fillStyle=cg;c.fillRect(0,270,360,35);
  D(c,0,268,360,3,"#bbb");
  // Stove with glow
  RR(c,110,160,110,60,4,"#555");
  [[120,170],[152,170],[184,170]].forEach(function(p){
    c.fillStyle="#333";c.beginPath();c.arc(p[0]+10,p[1]+10,10,0,Math.PI*2);c.fill();
    c.fillStyle="rgba(255,100,0,0.15)";c.beginPath();c.arc(p[0]+10,p[1]+10,8,0,Math.PI*2);c.fill();
  });
  // Range hood
  c.fillStyle="rgba(200,200,200,0.2)";c.beginPath();c.arc(165,130,24,0,Math.PI*2);c.fill();
  D(c,143,148,44,6,"#aaa");
  // Fridge with highlights
  RR(c,275,80,75,190,5,"#ccc");RR(c,279,85,67,85,3,"#ddd");RR(c,279,175,67,90,3,"#ddd");
  c.fillStyle="rgba(255,255,255,0.08)";c.fillRect(279,85,20,85);
  c.fillStyle="#888";c.beginPath();c.arc(347,127,3,0,Math.PI*2);c.fill();
  c.fillStyle="#888";c.beginPath();c.arc(347,217,3,0,Math.PI*2);c.fill();
  // Kids' drawings on fridge
  D(c,290,100,12,15,"#fff");D(c,310,95,10,12,"#fff");c.fillStyle="#e74c3c";c.fillRect(292,105,3,3);c.fillStyle="#3498db";c.fillRect(312,99,3,3);
  // Sink
  RR(c,15,272,70,28,4,"#bbb");D(c,40,250,12,25,"#888");
  c.fillStyle="rgba(135,206,235,0.3)";c.fillRect(20,276,60,20);
  // Banana
  D(c,238,262,22,8,P.gold);
}
function paintLiving(c){
  D(c,0,370,360,270,"#5c4a3a");
  // Hardwood grain
  for(var i=0;i<360;i+=24){c.fillStyle="rgba(80,60,40,0.15)";c.fillRect(i,370,1,270);}
  var g=c.createLinearGradient(0,0,0,370);g.addColorStop(0,"#3d3450");g.addColorStop(1,"#4d3c5e");c.fillStyle=g;c.fillRect(0,0,360,370);
  WF(c,370);
  // TV with screen glow
  RR(c,100,60,160,100,4,"#222");RR(c,105,65,150,90,3,"#111");
  var tg=c.createRadialGradient(180,110,10,180,110,70);tg.addColorStop(0,"#1a4a7a");tg.addColorStop(1,"#0a1a3a");c.fillStyle=tg;c.fillRect(110,70,140,80);
  c.fillStyle="rgba(30,80,150,0.06)";c.fillRect(80,50,200,180); // screen glow
  RR(c,150,160,60,18,3,"#333");D(c,135,176,90,3,"#222");
  // Couch with cushions
  RR(c,16,355,228,68,6,"#8B4513");RR(c,20,350,220,10,3,"#A0522D");
  // Individual cushions
  [[30,360,40,55,P.pink],[75,357,38,57,P.gold],[118,361,42,53,P.teal],[165,358,40,55,P.purple],[210,362,30,48,"#FF6B6B"]].forEach(function(p){
    RR(c,p[0],p[1],p[2],p[3],4,p[4]);c.fillStyle="rgba(255,255,255,0.06)";c.fillRect(p[0]+2,p[1]+2,p[2]/3,p[3]-4);
  });
  D(c,16,360,8,65,"#6B3410");D(c,240,360,8,65,"#6B3410");
  SH(c,16,426,228);
  // Bookshelf with varied books
  D(c,270,100,80,220,P.dbrown);
  for(var s=0;s<4;s++){D(c,274,110+s*52,72,4,P.brown);
    var bcolors=["#e74c3c","#3498db","#2ecc71","#9b59b6","#FF8C00","#FFD700"];
    for(var b=0;b<4;b++){var bw=12+rI(8),bh=38+rI(10);RR(c,276+b*18,115+s*52,bw,bh,2,bcolors[(s*4+b)%6]);}}
  // Rug with pattern
  RR(c,60,435,200,50,4,"#8B2252");
  c.strokeStyle="rgba(255,200,220,0.15)";c.lineWidth=1;
  for(var r=0;r<3;r++){c.beginPath();c.rect(68+r*12,443+r*2,176-r*24,34-r*4);c.stroke();}
  // Lamp with glow
  D(c,260,300,5,60,P.gold);
  c.fillStyle=P.yellow;c.beginPath();c.moveTo(248,290);c.lineTo(263,252);c.lineTo(278,290);c.closePath();c.fill();
  c.fillStyle="rgba(255,236,139,0.08)";c.beginPath();c.arc(263,290,40,0,Math.PI*2);c.fill();
}
function paintKids(c){
  D(c,0,370,360,270,"#5c6b8a");var g=c.createLinearGradient(0,0,0,370);g.addColorStop(0,"#4a6fa5");g.addColorStop(1,"#3d5a80");c.fillStyle=g;c.fillRect(0,0,360,370);
  WF(c,370);
  // Glow-in-dark stars
  c.fillStyle=P.yellow;[[25,25],[85,55],[270,18],[330,48],[180,12],[140,35],[320,30]].forEach(function(p){
    c.save();c.globalAlpha=0.6+Math.random()*0.4;c.beginPath();
    for(var i=0;i<5;i++){var a=i*Math.PI*4/5-Math.PI/2;c.lineTo(p[0]+4*Math.cos(a),p[1]+4*Math.sin(a));a+=Math.PI*2/5;c.lineTo(p[0]+2*Math.cos(a),p[1]+2*Math.sin(a));}
    c.closePath();c.fill();c.restore();
  });
  // Bunk bed
  RR(c,10,140,110,220,4,P.dbrown);RR(c,15,148,100,40,3,"#4169E1");RR(c,15,260,100,40,3,P.pink);D(c,10,245,110,5,P.brown);
  // Toy box
  RR(c,140,420,70,45,5,"#e74c3c");D(c,140,414,70,9,"#c0392b");c.fillStyle=P.yellow;c.font="bold 9px monospace";c.fillText("TOYS",158,445);
  // LEGO scattered
  [[220,475,"#e74c3c"],[260,485,"#3498db"],[180,490,"#2ecc71"],[310,480,P.gold],[240,488,"#9b59b6"],[290,478,"#FF8C00"]].forEach(function(l){
    RR(c,l[0],l[1],8,5,1,l[2]);D(c,l[0]+2,l[1]-2,2,2,l[2]);D(c,l[0]+5,l[1]-2,2,2,l[2]);
  });
  // Desk
  D(c,220,220,130,10,P.brown);D(c,228,230,5,110,P.dbrown);D(c,342,230,5,110,P.dbrown);
  // Crayon drawings on desk
  D(c,240,212,35,10,"#fff");c.fillStyle="#e74c3c";c.beginPath();c.arc(250,216,3,0,Math.PI*2);c.fill();
  c.fillStyle="#3498db";c.beginPath();c.arc(262,215,2,0,Math.PI*2);c.fill();
  // Game poster
  RR(c,178,58,68,57,3,"#fff");RR(c,182,62,60,49,2,"#222");c.fillStyle="#0f0";c.font="bold 8px monospace";c.fillText("GAME",196,88);c.fillText("OVER",196,100);
  // Mr. Rex
  D(c,305,400,28,38,P.green);D(c,296,394,14,14,P.green);D(c,320,432,14,10,P.green);
  c.fillStyle="#fff";c.fillRect(310,406,3,2);c.fillRect(316,406,3,2);
}
function paintBathroom(c){
  D(c,0,370,360,270,"#add8e6");for(var i=0;i<360;i+=22)for(var j=370;j<640;j+=22)D(c,i,j,21,21,"#9fc5d8");
  D(c,0,0,360,370,"#b0d4e8");for(var i=0;i<360;i+=22)for(var j=0;j<370;j+=22)D(c,i,j,21,21,"#a0c4d8");
  WF(c,370);
  // Bathtub with water
  RR(c,10,290,180,80,8,"#fff");
  c.fillStyle="rgba(135,206,250,0.35)";c.fillRect(18,298,164,64);
  // Bubble effect
  [[30,310],[60,305],[100,308],[140,303],[160,312]].forEach(function(b){
    c.fillStyle="rgba(255,255,255,0.3)";c.beginPath();c.arc(b[0],b[1],4,0,Math.PI*2);c.fill();
  });
  D(c,18,285,10,14,"#ccc");
  // Ducks in tub
  [[28,300],[55,305],[82,298],[109,302],[136,300]].forEach(function(p){
    c.fillStyle=P.gold;c.beginPath();c.arc(p[0]+6,p[1]+4,6,0,Math.PI*2);c.fill();
    c.fillStyle=P.gold;c.beginPath();c.arc(p[0]+12,p[1],4,0,Math.PI*2);c.fill();
    c.fillStyle=P.orange;c.fillRect(p[0]+14,p[1]-1,4,2);
    c.fillStyle="#333";c.fillRect(p[0]+11,p[1]-2,1,1);
  });
  // Toilet
  RR(c,220,310,50,65,6,"#fff");RR(c,216,300,58,14,4,"#eee");RR(c,226,288,40,16,4,"#ddd");
  SH(c,220,377,50);
  // Sink
  RR(c,280,270,70,35,5,"#fff");D(c,308,250,18,24,"#ccc");
  // Mirror with frame and reflection
  RR(c,275,80,75,95,4,"#c0c0c0");RR(c,279,84,67,87,3,"#b0d4e8");
  c.fillStyle="rgba(255,255,255,0.1)";c.fillRect(279,84,20,87);
  // Towel rack
  D(c,165,125,38,7,"#ccc");
  RR(c,165,130,38,75,3,P.pink);
  c.fillStyle="rgba(255,255,255,0.06)";c.fillRect(165,130,12,75);
}
function paintGarage(c){
  D(c,0,370,360,270,"#808080");for(var i=0;i<360;i+=50)D(c,i,370,1,270,"rgba(0,0,0,0.08)");
  // Oil stains
  c.fillStyle="rgba(40,30,20,0.12)";c.beginPath();c.ellipse(100,500,25,12,0.3,0,Math.PI*2);c.fill();
  c.beginPath();c.ellipse(260,480,18,8,0,0,Math.PI*2);c.fill();
  D(c,0,0,360,370,"#555");
  WF(c,370);
  // Garage door with panels
  RR(c,70,30,220,300,4,"#777");for(var i=0;i<7;i++){RR(c,74,35+i*42,212,37,3,"#888");D(c,74,35+i*42,212,2,"#999");}
  // '85 Corvette with curves
  c.fillStyle=P.gold;c.beginPath();c.moveTo(25,435);c.lineTo(30,380);c.quadraticCurveTo(95,365,165,380);c.lineTo(165,435);c.closePath();c.fill();
  RR(c,33,366,124,18,4,"#FFEC8B");
  RR(c,50,369,35,11,3,P.sky);RR(c,108,369,35,11,3,P.sky);
  c.strokeStyle="#333";c.lineWidth=2;c.beginPath();c.arc(58,443,13,0,Math.PI*2);c.stroke();c.beginPath();c.arc(140,443,13,0,Math.PI*2);c.stroke();
  c.fillStyle="#333";c.beginPath();c.arc(58,443,5,0,Math.PI*2);c.fill();c.beginPath();c.arc(140,443,5,0,Math.PI*2);c.fill();
  c.fillStyle="#fff";c.font="bold 6px monospace";c.fillText("'85 VETTE",57,410);
  // Audi
  RR(c,195,385,140,50,5,"#c0c0c0");RR(c,208,372,100,16,4,"#d0d0d0");
  RR(c,220,375,30,10,3,P.sky);RR(c,262,375,30,10,3,P.sky);
  c.strokeStyle="#333";c.beginPath();c.arc(228,443,12,0,Math.PI*2);c.stroke();c.beginPath();c.arc(312,443,12,0,Math.PI*2);c.stroke();
  c.fillStyle="#333";c.font="bold 6px monospace";c.fillText("'01 AUDI TT",218,408);
  // Workbench with tools
  D(c,15,170,12,50,"#ccc");D(c,35,180,7,40,"#aaa");D(c,52,165,16,5,P.red);D(c,52,165,4,45,"#888");
  // Boxes
  RR(c,310,140,40,40,3,P.tan);D(c,310,136,40,6,P.brown);c.fillStyle="#444";c.font="7px monospace";c.fillText("STUFF",315,160);
}
function paintLaundry(c){
  D(c,0,370,360,270,"#b0b0b0");D(c,0,0,360,370,"#d0d0d0");
  WF(c,370);
  // Washer with round door and detail
  RR(c,15,210,95,110,5,"#eee");RR(c,28,228,70,70,4,"#ccc");
  c.strokeStyle="#aaa";c.lineWidth=2;c.beginPath();c.arc(63,263,24,0,Math.PI*2);c.stroke();
  c.fillStyle="rgba(135,206,250,0.2)";c.beginPath();c.arc(63,263,20,0,Math.PI*2);c.fill();
  RR(c,22,215,14,8,2,"#999");RR(c,40,215,14,8,2,"#999");
  // Dryer
  RR(c,125,210,95,110,5,"#eee");RR(c,138,228,70,70,4,"#ccc");c.beginPath();c.arc(173,263,24,0,Math.PI*2);c.stroke();
  // Mt. Washmore
  c.fillStyle="#aaa";c.beginPath();c.moveTo(230,480);c.quadraticCurveTo(290,340,350,480);c.closePath();c.fill();
  for(var i=0;i<8;i++){RR(c,238+rI(80),380+rI(70),22+rI(14),10+rI(8),3,["#e74c3c","#3498db","#2ecc71",P.pink,P.gold,"#9b59b6",P.orange,"#FF6B6B"][i]);}
  // Shelf
  D(c,240,80,110,6,P.brown);RR(c,248,48,32,32,3,"#3498db");RR(c,286,44,38,36,3,"#e74c3c");RR(c,328,50,22,30,3,"#2ecc71");
}
function paintBackyard(c){
  var g=c.createLinearGradient(0,0,0,250);g.addColorStop(0,"#87CEEB");g.addColorStop(1,"#b0e0ff");c.fillStyle=g;c.fillRect(0,0,360,250);
  // Sun with rays
  c.fillStyle="rgba(255,215,0,0.08)";c.beginPath();c.arc(300,55,70,0,Math.PI*2);c.fill();
  c.fillStyle="rgba(255,215,0,0.15)";c.beginPath();c.arc(300,55,45,0,Math.PI*2);c.fill();
  c.fillStyle="#FFD700";c.beginPath();c.arc(300,55,24,0,Math.PI*2);c.fill();
  // Clouds
  c.fillStyle="rgba(255,255,255,0.5)";c.beginPath();c.arc(80,40,18,0,Math.PI*2);c.fill();c.beginPath();c.arc(100,35,22,0,Math.PI*2);c.fill();c.beginPath();c.arc(120,42,16,0,Math.PI*2);c.fill();
  // Grass
  D(c,0,250,360,390,P.green);for(var i=0;i<360;i+=3)D(c,i,248+rI(5),2,3+rI(7),"#1a7a1a");
  // Tree with better foliage
  D(c,40,100,18,170,P.brown);
  c.fillStyle="rgba(60,30,10,0.15)";c.fillRect(44,100,5,170);
  c.fillStyle=P.green;c.beginPath();c.arc(49,90,42,0,Math.PI*2);c.fill();
  c.fillStyle=P.lgreen;c.beginPath();c.arc(38,78,26,0,Math.PI*2);c.fill();
  c.fillStyle="rgba(144,238,144,0.5)";c.beginPath();c.arc(60,82,18,0,Math.PI*2);c.fill();
  // Fence with posts
  for(var f=0;f<360;f+=26){D(c,f,230,7,38,P.tan);D(c,f-1,222,9,10,P.tan);D(c,f+2,225,3,3,"rgba(0,0,0,0.1)");}
  D(c,0,248,360,5,"#b89a5a");D(c,0,260,360,5,"#b89a5a");
  // Neighbor's Cat (slender, aloof, judgy)
  c.fillStyle="#888";// gray cat body
  c.beginPath();c.ellipse(248,425,10,7,0,0,Math.PI*2);c.fill();// body
  c.beginPath();c.arc(260,415,6,0,Math.PI*2);c.fill();// head
  // Pointy ears
  c.fillStyle="#888";
  c.beginPath();c.moveTo(255,410);c.lineTo(258,403);c.lineTo(261,410);c.closePath();c.fill();
  c.beginPath();c.moveTo(262,410);c.lineTo(265,403);c.lineTo(268,410);c.closePath();c.fill();
  // Inner ear pink
  c.fillStyle="#FFB6C1";
  c.beginPath();c.moveTo(256,410);c.lineTo(258,405);c.lineTo(260,410);c.closePath();c.fill();
  c.beginPath();c.moveTo(263,410);c.lineTo(265,405);c.lineTo(267,410);c.closePath();c.fill();
  // Eyes (judgy, half-lidded)
  c.fillStyle="#FFD700";c.beginPath();c.ellipse(258,415,2.5,2,0,0,Math.PI*2);c.fill();
  c.beginPath();c.ellipse(263,415,2.5,2,0,0,Math.PI*2);c.fill();
  c.fillStyle="#0a0";c.beginPath();c.ellipse(258,415,1,1.5,0,0,Math.PI*2);c.fill();
  c.beginPath();c.ellipse(263,415,1,1.5,0,0,Math.PI*2);c.fill();
  // Whiskers
  c.strokeStyle="rgba(200,200,200,0.6)";c.lineWidth=0.8;
  c.beginPath();c.moveTo(252,416);c.lineTo(244,414);c.stroke();
  c.beginPath();c.moveTo(252,418);c.lineTo(244,419);c.stroke();
  c.beginPath();c.moveTo(268,416);c.lineTo(276,414);c.stroke();
  c.beginPath();c.moveTo(268,418);c.lineTo(276,419);c.stroke();
  // Curled tail (up and over)
  c.strokeStyle="#888";c.lineWidth=3;
  c.beginPath();c.moveTo(238,423);c.quadraticCurveTo(228,408,238,400);c.quadraticCurveTo(248,394,252,402);c.stroke();
  // Legs
  D(c,242,428,4,8,"#777");D(c,250,428,4,8,"#777");
  SH(c,238,438,24);
  // Hole
  c.fillStyle="#1a4a1a";c.beginPath();c.ellipse(158,456,18,6,0,0,Math.PI*2);c.fill();
  c.fillStyle="#0a3a0a";c.beginPath();c.ellipse(158,456,14,4,0,0,Math.PI*2);c.fill();
  // BBQ
  RR(c,300,380,36,36,6,"#333");RR(c,304,370,28,12,4,"#555");
}
function paintAttic(c){
  D(c,0,370,360,270,"#5c4a3a");
  // Wooden floorboards
  for(var i=0;i<360;i+=45){D(c,i,370,1,270,"rgba(0,0,0,0.1)");}
  // Angled ceiling with wood grain
  c.fillStyle="#3a3028";c.beginPath();c.moveTo(0,0);c.lineTo(180,100);c.lineTo(360,0);c.lineTo(360,370);c.lineTo(0,370);c.closePath();c.fill();
  // Ceiling beams
  c.strokeStyle="#4a3a28";c.lineWidth=6;
  c.beginPath();c.moveTo(0,130);c.lineTo(360,130);c.stroke();
  c.beginPath();c.moveTo(0,230);c.lineTo(360,230);c.stroke();
  c.beginPath();c.moveTo(90,100);c.lineTo(90,370);c.stroke();
  c.beginPath();c.moveTo(180,100);c.lineTo(180,370);c.stroke();
  c.beginPath();c.moveTo(270,100);c.lineTo(270,370);c.stroke();
  c.strokeStyle="#5a4a38";c.lineWidth=2;
  c.beginPath();c.moveTo(0,130);c.lineTo(360,130);c.stroke();
  c.beginPath();c.moveTo(0,230);c.lineTo(360,230);c.stroke();
  WF(c,370);
  // Hanging light bulb
  D(c,178,100,4,22,"#555");c.fillStyle="#FFE4B5";c.beginPath();c.arc(180,128,6,0,Math.PI*2);c.fill();
  c.fillStyle="rgba(255,228,181,0.06)";c.beginPath();c.arc(180,128,40,0,Math.PI*2);c.fill();
  // Xmas box with bow
  RR(c,18,318,58,42,4,P.tan);D(c,44,318,6,42,"rgba(200,0,0,0.3)");D(c,18,336,58,4,"rgba(200,0,0,0.3)");
  c.fillStyle="#c00";c.beginPath();c.arc(47,318,6,0,Math.PI*2);c.fill();
  c.fillStyle="#555";c.font="bold 6px monospace";c.fillText("XMAS",28,345);
  // Mystery box with question marks
  RR(c,83,308,54,54,5,"#b89a5a");RR(c,86,311,48,48,3,"#a08a4a");
  c.fillStyle="#555";c.font="bold 10px monospace";c.fillText("???",97,342);
  // 2019 box
  RR(c,198,328,48,30,4,P.tan);c.fillStyle="#555";c.font="bold 7px monospace";c.fillText("2019",207,349);
  // Old mirror with ornate frame
  RR(c,133,158,58,78,4,"#8B6914");RR(c,137,162,50,70,3,"#2a2a4a");
  c.fillStyle="rgba(150,180,200,0.08)";c.fillRect(137,162,16,70);
  // Trunk with latch
  RR(c,258,338,82,30,5,"#654321");
  var tg=c.createLinearGradient(258,335,258,342);tg.addColorStop(0,"#8a6a41");tg.addColorStop(1,"#654321");c.fillStyle=tg;c.fillRect(258,335,82,7);
  RR(c,292,336,18,6,2,P.gold);
  SH(c,258,370,82);
  // Crystal ball with glow
  c.fillStyle="rgba(150,100,200,0.12)";c.beginPath();c.arc(325,310,22,0,Math.PI*2);c.fill();
  c.fillStyle="rgba(150,100,200,0.5)";c.beginPath();c.arc(325,310,14,0,Math.PI*2);c.fill();
  c.fillStyle="rgba(200,160,255,0.3)";c.beginPath();c.arc(320,304,5,0,Math.PI*2);c.fill();
  RR(c,311,322,28,8,3,"#555");
  // Dust motes atmosphere
  c.fillStyle="rgba(255,228,181,0.04)";c.fillRect(0,0,360,370);
}
function paintBedroom(c){
  D(c,0,370,360,270,"#d4a0b0");var g=c.createLinearGradient(0,0,0,370);g.addColorStop(0,"#e8d0e0");g.addColorStop(1,"#d4b0c0");c.fillStyle=g;c.fillRect(0,0,360,370);
  WF(c,370);
  // Bed with pillows and blanket
  RR(c,15,260,210,90,5,"#8B4513");RR(c,19,255,202,8,3,P.white);
  // Blanket with gradient
  var bg=c.createLinearGradient(19,265,19,345);bg.addColorStop(0,"#DDA0DD");bg.addColorStop(1,"#C890C8");c.fillStyle=bg;c.fillRect(19,265,202,80);
  // Pillows
  RR(c,24,256,55,18,5,P.white);RR(c,90,256,55,18,5,P.white);
  c.fillStyle="rgba(255,255,255,0.15)";c.fillRect(28,258,20,12);c.fillRect(94,258,20,12);
  // Some stray clothes on bed corner
  RR(c,120,260,60,14,3,"#e74c3c");RR(c,140,255,40,10,3,"#3498db");
  SH(c,15,352,210);
  // Nightstand
  RR(c,235,310,50,55,4,P.dbrown);c.fillStyle=P.gold;c.beginPath();c.arc(254,308,4,0,Math.PI*2);c.fill();
  // Vanity with mirror
  RR(c,240,210,110,60,4,P.white);D(c,248,218,94,4,P.lgray);
  // Lipstick, mascara
  D(c,260,208,4,12,"#e74c3c");D(c,270,210,3,10,"#333");D(c,280,209,6,8,P.pink);
  // Mirror with ornate frame
  RR(c,258,133,74,62,4,"#c0c0c0");RR(c,262,137,66,54,3,"#FFE4E1");
  c.fillStyle="rgba(255,255,255,0.1)";c.fillRect(262,137,20,54);
  // Window with curtains — cat staring in
  RR(c,100,35,110,95,3,P.sky);D(c,96,30,118,5,P.white);D(c,96,130,118,5,P.white);D(c,153,35,4,95,P.white);
  c.fillStyle="rgba(221,160,221,0.7)";
  c.beginPath();c.moveTo(96,35);c.quadraticCurveTo(106,80,96,130);c.lineTo(112,130);c.quadraticCurveTo(108,80,112,35);c.closePath();c.fill();
  c.beginPath();c.moveTo(214,35);c.quadraticCurveTo(204,80,214,130);c.lineTo(198,130);c.quadraticCurveTo(202,80,198,35);c.closePath();c.fill();
  // Neighbor's cat staring in through window (judgmentally)
  c.fillStyle="#888";c.beginPath();c.ellipse(155,85,10,8,0,0,Math.PI*2);c.fill();// cat face in window
  c.beginPath();c.moveTo(148,78);c.lineTo(145,70);c.lineTo(151,77);c.closePath();c.fill();// left ear
  c.beginPath();c.moveTo(162,78);c.lineTo(165,70);c.lineTo(159,77);c.closePath();c.fill();// right ear
  c.fillStyle="#FFD700";c.beginPath();c.ellipse(151,85,2.5,2,0,0,Math.PI*2);c.fill();
  c.beginPath();c.ellipse(159,85,2.5,2,0,0,Math.PI*2);c.fill();
  c.fillStyle="#0a0";c.beginPath();c.ellipse(151,85,1,1.5,0,0,Math.PI*2);c.fill();
  c.beginPath();c.ellipse(159,85,1,1.5,0,0,Math.PI*2);c.fill();
  // Cat whiskers
  c.strokeStyle="rgba(200,200,200,0.5)";c.lineWidth=0.7;
  c.beginPath();c.moveTo(146,87);c.lineTo(139,86);c.stroke();
  c.beginPath();c.moveTo(164,87);c.lineTo(171,86);c.stroke();
  // Flowers
  D(c,252,198,18,18,P.green);
  c.fillStyle=P.pink;c.beginPath();c.arc(258,193,5,0,Math.PI*2);c.fill();
  c.fillStyle=P.gold;c.beginPath();c.arc(264,190,4,0,Math.PI*2);c.fill();
  c.fillStyle=P.purple;c.beginPath();c.arc(254,189,3,0,Math.PI*2);c.fill();

  // === CLOTHES MOUNTAINS ===
  // Mountain 1 — big pile center-left (phone buried here)
  var cm1x=50,cm1y=490;
  c.fillStyle="#c0c0c0";c.beginPath();c.moveTo(cm1x,cm1y+30);c.quadraticCurveTo(cm1x+40,cm1y-40,cm1x+90,cm1y+20);c.quadraticCurveTo(cm1x+80,cm1y+35,cm1x,cm1y+35);c.closePath();c.fill();
  // Clothes layers on pile
  var pile1=[[cm1x+10,cm1y+15,50,10,"#e74c3c"],[cm1x+5,cm1y+22,45,10,"#3498db"],[cm1x+15,cm1y+8,35,8,"#FFD700"],[cm1x+8,cm1y+28,55,8,"#2ecc71"],[cm1x+20,cm1y+2,30,7,"#DDA0DD"]];
  pile1.forEach(function(p){RR(c,p[0],p[1],p[2],p[3],2,p[4]);});
  // Phone buried in pile — just barely peeking out
  RR(c,cm1x+30,cm1y+18,10,5,1,"#222");c.fillStyle="#1a3a5a";c.fillRect(cm1x+31,cm1y+19,8,3);
  c.fillStyle="#555";c.font="5px monospace";c.fillText("*bzz*",cm1x+24,cm1y+15);

  // Mountain 2 — right side, taller
  var cm2x=250,cm2y=460;
  c.fillStyle="#aaa";c.beginPath();c.moveTo(cm2x,cm2y+40);c.quadraticCurveTo(cm2x+30,cm2y-60,cm2x+70,cm2y+30);c.quadraticCurveTo(cm2x+60,cm2y+45,cm2x,cm2y+45);c.closePath();c.fill();
  var pile2=[[cm2x+5,cm2y+22,55,9,"#9b59b6"],[cm2x+10,cm2y+12,40,9,"#FF8C00"],[cm2x+8,cm2y+30,50,9,"#4169E1"],[cm2x+15,cm2y+3,30,8,"#FF69B4"],[cm2x+20,cm2y-8,22,8,"#e74c3c"]];
  pile2.forEach(function(p){RR(c,p[0],p[1],p[2],p[3],2,p[4]);});

  // Mountain 3 — left edge small pile
  var cm3x=0,cm3y=540;
  c.fillStyle="#b0b0b0";c.beginPath();c.moveTo(cm3x,cm3y+20);c.quadraticCurveTo(cm3x+20,cm3y-20,cm3x+45,cm3y+15);c.quadraticCurveTo(cm3x+40,cm3y+22,cm3x,cm3y+22);c.closePath();c.fill();
  [[cm3x+2,cm3y+8,35,8,"#00CED1"],[cm3x+5,cm3y+14,28,7,"#8B4513"],[cm3x+0,cm3y+2,20,7,"#FFD700"]].forEach(function(p){RR(c,p[0],p[1],p[2],p[3],2,p[4]);});

  // Clothes hanging off furniture edges
  RR(c,200,350,30,18,3,"#e74c3c");// off nightstand
  RR(c,230,265,25,14,2,"#FFD700");// off bed post area
  RR(c,290,215,18,22,2,"#3498db");// off vanity

  // Closet (overflowing)
  RR(c,310,100,50,130,4,P.dbrown);RR(c,313,103,44,124,3,"#4a3a28");
  // Clothes falling out of closet
  RR(c,308,180,10,14,2,"#e74c3c");RR(c,305,194,12,10,2,"#9b59b6");
  c.fillStyle="#666";c.beginPath();c.arc(334,103,3,0,Math.PI*2);c.fill();// door handle

  // Fashion magazine stack
  for(var mg2=0;mg2<3;mg2++){RR(c,232+mg2*2,295+mg2*2,28,18,2,["#FF69B4","#FFD700","#00CED1"][mg2]);}
  c.fillStyle="#fff";c.font="4px monospace";c.fillText("VOGUE",235,308);

  // Shoes scattered
  [[168,350,"#333"],[185,348,"#e74c3c"],[196,355,"#4169E1"]].forEach(function(s){RR(c,s[0],s[1],14,9,3,s[2]);});
}
function paintJesusBathroom(c){
  D(c,0,370,360,270,"#f5e6c8");var g=c.createLinearGradient(0,0,0,370);g.addColorStop(0,"#fff8dc");g.addColorStop(1,"#f5e6c8");c.fillStyle=g;c.fillRect(0,0,360,370);
  // Holy golden aura
  c.fillStyle="rgba(255,215,0,0.04)";c.fillRect(0,0,360,640);
  var hg=c.createRadialGradient(180,200,20,180,200,200);hg.addColorStop(0,"rgba(255,215,0,0.08)");hg.addColorStop(1,"rgba(255,215,0,0)");c.fillStyle=hg;c.fillRect(0,0,360,400);
  WF(c,370);
  // Golden bathtub
  RR(c,15,290,170,75,8,P.gold);RR(c,19,294,162,67,6,"#fff8dc");
  c.fillStyle="rgba(135,206,235,0.3)";c.fillRect(23,304,154,52);
  // Cross with glow
  D(c,65,50,10,60,P.gold);D(c,45,75,50,10,P.gold);
  c.fillStyle="rgba(255,215,0,0.1)";c.beginPath();c.arc(70,85,42,0,Math.PI*2);c.fill();
  c.fillStyle="rgba(255,215,0,0.06)";c.beginPath();c.arc(70,85,60,0,Math.PI*2);c.fill();

  // === PAINTING 1: Space Jesus vs The Devil (left wall) ===
  // Frame
  RR(c,10,38,100,118,4,"#8B6914");RR(c,14,42,92,110,3,"#1a0a2e");
  // Night sky bg in painting
  var spg=c.createLinearGradient(14,42,14,152);spg.addColorStop(0,"#050525");spg.addColorStop(1,"#0a0a3a");c.fillStyle=spg;c.fillRect(14,42,92,110);
  // Stars in painting
  c.fillStyle="rgba(255,255,255,0.5)";
  [[20,48],[30,55],[80,44],[95,52],[50,46],[70,50],[40,58]].forEach(function(s){c.beginPath();c.arc(s[0],s[1],0.8,0,Math.PI*2);c.fill();});
  // Space Jesus — left side of painting, golden glow
  c.fillStyle="rgba(255,215,0,0.12)";c.beginPath();c.arc(32,90,20,0,Math.PI*2);c.fill();
  // Jesus halo
  c.strokeStyle=P.gold;c.lineWidth=1.5;c.beginPath();c.arc(32,74,8,0,Math.PI*2);c.stroke();
  // Jesus body (white robe)
  c.fillStyle="#f0f0f0";c.beginPath();c.moveTo(26,82);c.lineTo(24,110);c.lineTo(40,110);c.lineTo(38,82);c.closePath();c.fill();
  // Jesus head
  c.fillStyle=P.skin;c.beginPath();c.arc(32,74,7,0,Math.PI*2);c.fill();
  c.fillStyle="#8B6914";c.beginPath();c.arc(32,70,7,Math.PI,2*Math.PI);c.fill();
  D(c,28,72,8,4,"#8B6914");// beard
  // Jesus raising hand (power pose)
  D(c,38,80,4,16,"#f0f0f0");// arm up
  c.fillStyle=P.gold;c.beginPath();c.arc(43,78,3,0,Math.PI*2);c.fill();// holy fist glow
  // The Devil — right side, red and menacing
  c.fillStyle="rgba(180,0,0,0.2)";c.beginPath();c.arc(80,90,18,0,Math.PI*2);c.fill();
  // Devil body (dark red)
  c.fillStyle="#8B0000";c.beginPath();c.moveTo(72,88);c.lineTo(70,112);c.lineTo(90,112);c.lineTo(88,88);c.closePath();c.fill();
  // Devil head
  c.fillStyle="#c0392b";c.beginPath();c.arc(80,80,8,0,Math.PI*2);c.fill();
  // Devil horns
  c.fillStyle="#8B0000";c.beginPath();c.moveTo(75,73);c.lineTo(72,64);c.lineTo(78,72);c.closePath();c.fill();
  c.beginPath();c.moveTo(85,73);c.lineTo(88,64);c.lineTo(82,72);c.closePath();c.fill();
  // Devil eyes glow
  c.fillStyle="#FF4500";c.beginPath();c.arc(77,80,1.5,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(83,80,1.5,0,Math.PI*2);c.fill();
  // Battle energy bolt between them
  c.strokeStyle=P.gold;c.lineWidth=1.5;
  c.beginPath();c.moveTo(43,90);c.lineTo(52,85);c.lineTo(58,92);c.lineTo(65,87);c.lineTo(70,90);c.stroke();
  // Painting label
  c.fillStyle="rgba(255,215,0,0.6)";c.font="bold 4px monospace";c.textAlign="center";c.fillText("SPACE JESUS vs THE DEVIL",60,155);c.textAlign="left";

  // === PAINTING 2: Jesus helping pinup girl out of the water (right wall) ===
  // Frame (ornate gold)
  RR(c,248,38,100,118,4,"#8B6914");
  c.strokeStyle=P.gold;c.lineWidth=1;c.strokeRect(250,40,96,114);
  RR(c,252,42,92,110,3,"#2a3a5a");
  // Ocean/water background
  var wg=c.createLinearGradient(252,42,252,152);wg.addColorStop(0,"#5ba3d9");wg.addColorStop(0.5,"#2a6a9a");wg.addColorStop(1,"#1a4a6a");c.fillStyle=wg;c.fillRect(252,42,92,110);
  // Water waves
  c.strokeStyle="rgba(135,206,235,0.4)";c.lineWidth=1;
  c.beginPath();c.moveTo(252,115);c.quadraticCurveTo(270,110,288,115);c.quadraticCurveTo(306,120,325,115);c.stroke();
  c.beginPath();c.moveTo(252,122);c.quadraticCurveTo(268,118,285,122);c.quadraticCurveTo(303,126,325,122);c.stroke();
  // Jesus (left side, standing on water, robe flowing)
  c.fillStyle="rgba(255,215,0,0.1)";c.beginPath();c.arc(272,82,16,0,Math.PI*2);c.fill();
  // Halo
  c.strokeStyle=P.gold;c.lineWidth=1.5;c.beginPath();c.arc(272,66,7,0,Math.PI*2);c.stroke();
  // White robe
  c.fillStyle="#f0f0f0";c.beginPath();c.moveTo(266,74);c.lineTo(263,118);c.lineTo(281,118);c.lineTo(278,74);c.closePath();c.fill();
  // Head
  c.fillStyle=P.skin;c.beginPath();c.arc(272,66,7,0,Math.PI*2);c.fill();
  c.fillStyle="#8B6914";c.beginPath();c.arc(272,62,7,Math.PI,2*Math.PI);c.fill();
  D(c,268,64,8,4,"#8B6914");
  // Outstretched arm to right
  D(c,278,72,16,4,"#f0f0f0");
  c.fillStyle=P.skin;c.beginPath();c.arc(295,74,3,0,Math.PI*2);c.fill();
  // Pinup girl — right side, being pulled from water
  // She's glamorous even in the water — red lips, curves, old-Hollywood style
  // Water splashing around her waist
  c.fillStyle="rgba(135,206,235,0.5)";c.beginPath();c.ellipse(310,118,14,6,0,0,Math.PI*2);c.fill();
  // Her lower body in water
  c.fillStyle="#e74c3c";c.beginPath();c.moveTo(302,108);c.lineTo(300,122);c.lineTo(320,122);c.lineTo(318,108);c.closePath();c.fill();// red swimsuit bottom
  // Torso (glamorous pose)
  c.fillStyle="#FF69B4";c.beginPath();c.moveTo(302,88);c.lineTo(301,108);c.lineTo(319,108);c.lineTo(318,88);c.closePath();c.fill();// pink swimsuit top
  // Her head
  c.fillStyle=P.skin;c.beginPath();c.arc(310,80,8,0,Math.PI*2);c.fill();
  // Glamorous curly red hair
  c.fillStyle="#c0392b";c.beginPath();c.arc(310,74,8,Math.PI,2*Math.PI);c.fill();
  D(c,305,72,5,10,"#c0392b");// left hair wave
  D(c,310,74,5,8,"#c0392b");// right hair
  // Bright red lips (signature)
  c.fillStyle="#c0392b";c.beginPath();c.arc(310,85,2.5,0.1*Math.PI,0.9*Math.PI);c.fill();
  // Reaching hand up toward Jesus
  D(c,301,86,4,16,"#FDBCB4");c.fillStyle=P.skin;c.beginPath();c.arc(300,84,3,0,Math.PI*2);c.fill();
  // Eyelashes/glamour
  c.fillStyle="#333";c.fillRect(307,78,2,2);c.fillRect(312,78,2,2);
  // Sparkle/shine on water around her
  c.fillStyle="rgba(255,255,255,0.4)";c.beginPath();c.arc(298,116,1.5,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(322,114,1.5,0,Math.PI*2);c.fill();
  // Their hands almost touching (iconic Sistine style gap)
  c.strokeStyle="rgba(255,215,0,0.5)";c.lineWidth=0.8;
  c.beginPath();c.moveTo(295,74);c.lineTo(300,82);c.stroke();
  // Painting label
  c.fillStyle="rgba(255,215,0,0.6)";c.font="bold 4px monospace";c.textAlign="center";c.fillText("RESCUED BY GRACE",300,155);c.textAlign="left";

  // Jesus portrait with halo (original, center)
  RR(c,145,40,70,90,5,"#8B6914");RR(c,149,44,62,82,4,"#f5e6c8");
  D(c,165,58,30,30,P.skin);D(c,160,50,40,12,"#654321");
  c.fillStyle=P.gold;c.beginPath();c.arc(180,46,22,Math.PI,2*Math.PI);c.fill();
  c.fillStyle="rgba(255,215,0,0.15)";c.beginPath();c.arc(180,55,35,0,Math.PI*2);c.fill();
  c.fillStyle="#fff";c.font="bold 6px monospace";c.fillText("JESUS SAVES",152,138);
  // Golden toilet
  RR(c,275,310,55,60,6,P.gold);RR(c,271,300,63,14,4,"#FFEC8B");
  // Bible
  RR(c,155,230,48,28,3,"#654321");c.fillStyle=P.gold;c.font="bold 6px monospace";c.fillText("BIBLE",162,248);
  // Candles with flames
  D(c,320,215,7,22,"#fff");D(c,335,218,7,19,"#fff");
  c.fillStyle="#FF8C00";c.beginPath();c.arc(324,212,4,0,Math.PI*2);c.fill();
  c.fillStyle="#FF8C00";c.beginPath();c.arc(339,215,3,0,Math.PI*2);c.fill();
  c.fillStyle="rgba(255,140,0,0.1)";c.beginPath();c.arc(324,212,12,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(339,215,10,0,Math.PI*2);c.fill();
}
function paintBasement(c){
  D(c,0,0,360,640,P.black);
  for(var i=0;i<360;i+=36)for(var j=370;j<640;j+=36)D(c,i,j,34,34,"#2a2020");
  for(var i=0;i<360;i+=42)for(var j=0;j<370;j+=32)D(c,i,j,40,30,"#1a1010");
  // Eerie red ambient
  var rg=c.createRadialGradient(180,460,10,180,460,120);rg.addColorStop(0,"rgba(139,0,0,0.12)");rg.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=rg;c.fillRect(60,360,240,200);
  // Pentagram with glow
  c.strokeStyle="#8B0000";c.lineWidth=3;c.beginPath();var cx=180,cy=460,r=44;
  for(var pp=0;pp<5;pp++){var a=(pp*4*Math.PI/5)-Math.PI/2;var x=cx+r*Math.cos(a),y=cy+r*Math.sin(a);pp===0?c.moveTo(x,y):c.lineTo(x,y);}c.closePath();c.stroke();
  c.beginPath();c.arc(cx,cy,r+4,0,Math.PI*2);c.stroke();
  // Candles with flickering glow
  [[155,440],[205,440],[160,490],[200,490],[180,425]].forEach(function(p){
    D(c,p[0],p[1],5,14,"#333");
    c.fillStyle="#FF4500";c.beginPath();c.arc(p[0]+2.5,p[1]-3,3,0,Math.PI*2);c.fill();
    c.fillStyle="rgba(255,69,0,0.08)";c.beginPath();c.arc(p[0]+2.5,p[1]-3,12,0,Math.PI*2);c.fill();
  });
  // Necronomicon
  RR(c,50,440,38,22,3,"#2a0a0a");c.fillStyle="#8B0000";c.font="bold 5px monospace";c.fillText("NECRONO",55,454);
  // Skull
  c.fillStyle="#ddd";c.beginPath();c.arc(309,445,10,0,Math.PI*2);c.fill();
  c.fillStyle="#ddd";c.beginPath();c.arc(309,432,6,0,Math.PI*2);c.fill();
  c.fillStyle="#333";c.fillRect(305,440,2,2);c.fillRect(312,440,2,2);
  // Wall torches
  D(c,15,100,7,38,P.brown);c.fillStyle="#FF4500";c.beginPath();c.arc(18,93,6,0,Math.PI*2);c.fill();
  c.fillStyle="rgba(255,69,0,0.08)";c.beginPath();c.arc(18,93,20,0,Math.PI*2);c.fill();
  D(c,338,100,7,38,P.brown);c.fillStyle="#FF4500";c.beginPath();c.arc(341,93,6,0,Math.PI*2);c.fill();
  c.fillStyle="rgba(255,69,0,0.08)";c.beginPath();c.arc(341,93,20,0,Math.PI*2);c.fill();
}
function paintAtticGym(c){
  D(c,0,370,360,270,"#3a3a3a");
  // Rubber floor texture
  for(var i=0;i<360;i+=20)for(var j=370;j<640;j+=20){if((Math.floor(i/20)+Math.floor(j/20))%2===0)D(c,i,j,20,20,"#353535");}
  // Angled ceiling
  c.fillStyle="#2a2828";c.beginPath();c.moveTo(0,0);c.lineTo(180,90);c.lineTo(360,0);c.lineTo(360,370);c.lineTo(0,370);c.closePath();c.fill();
  WF(c,370);
  // Ceiling beam
  c.strokeStyle="#444";c.lineWidth=4;c.beginPath();c.moveTo(0,90);c.lineTo(360,90);c.stroke();
  // Bench press with rounded barbell
  RR(c,28,278,114,10,3,"#555");
  RR(c,33,288,8,52,2,"#555");RR(c,128,288,8,52,2,"#555");
  // Weight plates (circles)
  c.fillStyle="#aaa";c.beginPath();c.arc(25,283,10,0,Math.PI*2);c.fill();
  c.fillStyle="#888";c.beginPath();c.arc(16,283,8,0,Math.PI*2);c.fill();
  c.fillStyle="#aaa";c.beginPath();c.arc(143,283,10,0,Math.PI*2);c.fill();
  c.fillStyle="#888";c.beginPath();c.arc(152,283,8,0,Math.PI*2);c.fill();
  SH(c,28,342,114);
  // Dumbbells (rounded)
  RR(c,168,428,42,12,4,"#888");
  c.fillStyle="#555";c.beginPath();c.arc(170,434,8,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(208,434,8,0,Math.PI*2);c.fill();
  // Large wall mirror with reflection
  RR(c,88,128,184,114,6,"#c0c0c0");RR(c,92,132,176,106,4,"rgba(200,200,220,0.5)");
  c.fillStyle="rgba(255,255,255,0.06)";c.fillRect(92,132,50,106);
  // Motivational poster with frame
  RR(c,278,107,72,52,3,"#222");RR(c,281,110,66,46,2,"#111");
  c.fillStyle="#FF4500";c.font="bold 7px monospace";c.fillText("NO PAIN",288,130);c.fillText("NO GAIN",288,144);
  // Pull-up bar
  RR(c,263,100,84,6,3,"#888");D(c,267,100,5,50,"#555");D(c,340,100,5,50,"#555");
  // Pull-up bar grips
  RR(c,278,96,10,10,2,"#333");RR(c,306,96,10,10,2,"#333");
  // Yoga mat (rolled edge)
  RR(c,128,398,104,28,4,"#2ecc71");
  c.fillStyle="rgba(0,0,0,0.1)";c.fillRect(128,398,104,8);
  // Water bottle
  RR(c,248,410,12,22,3,"#3498db");D(c,250,406,8,6,"#ddd");
  // Sweat towel
  RR(c,55,400,45,15,3,P.white);c.fillStyle="rgba(0,0,0,0.05)";c.fillRect(58,403,20,9);
}
function paintPantry(c){
  D(c,0,370,360,270,"#5c4a3a");
  // Wood floorboards
  for(var i=0;i<360;i+=40){D(c,i,370,1,270,"rgba(0,0,0,0.08)");}
  // Warm wall
  var g=c.createLinearGradient(0,0,0,370);g.addColorStop(0,"#e8d5b7");g.addColorStop(1,"#d4c4a0");c.fillStyle=g;c.fillRect(0,0,360,370);
  WF(c,370);
  // Shelves with brackets and items
  for(var s=0;s<5;s++){
    var sy=20+s*68;
    // Shelf board with shadow
    RR(c,8,sy+56,344,7,2,P.brown);
    D(c,8,sy+63,344,3,"rgba(0,0,0,0.1)");
    // Shelf brackets
    D(c,20,sy+42,4,16,"#8B6914");D(c,336,sy+42,4,16,"#8B6914");D(c,178,sy+42,4,16,"#8B6914");
    // Cans and jars
    for(var i=0;i<6;i++){
      var col=["#e74c3c","#3498db","#2ecc71","#FFD700","#9b59b6","#FF8C00"][i];
      var cx=18+i*56;
      // Can with highlight
      RR(c,cx,sy+4,18,52,3,col);
      c.fillStyle="rgba(255,255,255,0.15)";c.fillRect(cx+2,sy+4,5,52);
      // Label
      RR(c,cx+1,sy+18,16,16,2,"rgba(255,255,255,0.7)");
      // Jar next to can
      RR(c,cx+22,sy+12,14,44,3,P.tan);
      c.fillStyle="rgba(255,255,255,0.1)";c.fillRect(cx+23,sy+12,4,44);
      RR(c,cx+23,sy+8,12,6,2,"#8B6914");
    }
  }
  // Rice bag
  RR(c,278,328,62,42,5,"#fff");
  c.fillStyle="rgba(0,0,0,0.03)";c.fillRect(278,348,62,22);
  c.fillStyle="#333";c.font="bold 7px monospace";c.fillText("RICE",296,355);
  c.fillStyle="#888";c.font="5px monospace";c.fillText("50 LBS",296,363);
  SH(c,278,372,62);
}
function paintLM1(c){
  D(c,0,370,360,270,"#909090");
  // Concrete floor texture
  for(var i=0;i<360;i+=60)for(var j=370;j<640;j+=60){c.fillStyle="rgba(0,0,0,0.04)";c.fillRect(i,j,58,58);}
  D(c,0,0,360,370,"#a0a0a0");
  // Pipe along ceiling
  RR(c,0,8,360,8,3,"#666");D(c,0,16,360,2,"rgba(0,0,0,0.15)");
  // Dripping water
  c.fillStyle="rgba(100,180,255,0.3)";c.beginPath();c.arc(120,22,2,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(120,30,1.5,0,Math.PI*2);c.fill();
  WF(c,370);
  // Washing machines in a row with detail
  for(var m=0;m<4;m++){
    var mx=10+m*88;
    // Machine body
    RR(c,mx,200,38,110,4,"#ddd");RR(c,mx+42,200,38,110,4,"#ddd");
    // Machine shadows
    c.fillStyle="rgba(0,0,0,0.06)";c.fillRect(mx,290,80,20);
    // Drum circles
    c.strokeStyle="#bbb";c.lineWidth=2;
    c.beginPath();c.arc(mx+19,260,14,0,Math.PI*2);c.stroke();
    c.beginPath();c.arc(mx+61,260,14,0,Math.PI*2);c.stroke();
    // Inner drum
    c.fillStyle="rgba(100,140,200,0.12)";
    c.beginPath();c.arc(mx+19,260,10,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(mx+61,260,10,0,Math.PI*2);c.fill();
    // Control knobs
    c.fillStyle="#999";c.beginPath();c.arc(mx+12,208,3,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(mx+24,208,3,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(mx+54,208,3,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(mx+66,208,3,0,Math.PI*2);c.fill();
  }
  // Breaker panel
  RR(c,138,53,84,78,4,"#555");RR(c,142,57,76,70,3,"#444");
  // Breaker switches with colored indicators
  var bx=[150,164,178];var by=[64,64,64];var bc=["#f44","#4f4","#f44"];
  for(var b=0;b<3;b++){RR(c,bx[b],by[b],10,7,1,bc[b]);}
  bx=[150,164,178];by=[80,80,80];bc=["#4f4","#4f4","#f44"];
  for(var b=0;b<3;b++){RR(c,bx[b],by[b],10,7,1,bc[b]);}
  c.fillStyle="#ff0";c.font="bold 6px monospace";c.fillText("BREAKERS",150,140);
  // Flickering light
  c.fillStyle="rgba(255,255,200,0.04)";c.fillRect(120,0,120,370);
}
function paintLM2(c){
  D(c,0,370,360,270,"#808080");
  // Concrete floor cracks
  c.strokeStyle="rgba(0,0,0,0.08)";c.lineWidth=1;
  c.beginPath();c.moveTo(50,420);c.lineTo(120,500);c.lineTo(180,480);c.stroke();
  c.beginPath();c.moveTo(280,390);c.lineTo(310,450);c.stroke();
  D(c,0,0,360,370,"#888");
  // Pipe
  RR(c,0,12,360,6,2,"#555");D(c,0,18,360,2,"rgba(0,0,0,0.12)");
  WF(c,370);
  // More washing machines
  for(var m=0;m<5;m++){
    var mx=8+m*70;
    RR(c,mx,230,32,90,3,"#ccc");
    // Drum
    c.strokeStyle="#aaa";c.lineWidth=1;c.beginPath();c.arc(mx+16,280,11,0,Math.PI*2);c.stroke();
    c.fillStyle="rgba(100,140,200,0.1)";c.beginPath();c.arc(mx+16,280,8,0,Math.PI*2);c.fill();
    // Knob
    c.fillStyle="#999";c.beginPath();c.arc(mx+16,238,3,0,Math.PI*2);c.fill();
    SH(c,mx,322,32);
  }
  // Ominous sign with glow
  RR(c,58,78,244,30,4,"#444");RR(c,61,81,238,24,3,"#333");
  c.fillStyle="#f44";c.font="bold 9px monospace";c.fillText("YOU ARE HERE...",82,98);
  // Red glow behind text
  c.fillStyle="rgba(255,68,68,0.04)";c.fillRect(58,0,244,370);
  // Scattered sock
  c.fillStyle="#fff";c.beginPath();c.ellipse(300,400,8,5,0.3,0,Math.PI*2);c.fill();
}
function paintLM3(c){
  D(c,0,370,360,270,"#707070");D(c,0,0,360,370,"#7a7a7a");
  // Floor cracks
  c.strokeStyle="rgba(0,0,0,0.1)";c.lineWidth=1;
  c.beginPath();c.moveTo(100,400);c.lineTo(200,500);c.stroke();
  WF(c,370);
  // EXIT sign with green glow
  RR(c,128,18,104,30,4,"#006400");
  c.fillStyle="rgba(0,255,0,0.06)";c.beginPath();c.arc(180,33,50,0,Math.PI*2);c.fill();
  c.fillStyle="#0f0";c.font="bold 12px monospace";c.fillText("EXIT",156,38);
  // Arrow pointing to exit
  c.fillStyle="#0f0";c.beginPath();c.moveTo(180,52);c.lineTo(172,60);c.lineTo(188,60);c.closePath();c.fill();
  // Three final machines
  for(var m=0;m<3;m++){
    var mx=15+m*120;
    RR(c,mx,218,82,84,5,"#bbb");
    // Drum with detail
    c.strokeStyle="#999";c.lineWidth=2;c.beginPath();c.arc(mx+41,262,20,0,Math.PI*2);c.stroke();
    c.fillStyle="rgba(100,140,200,0.1)";c.beginPath();c.arc(mx+41,262,15,0,Math.PI*2);c.fill();
    // Cross pattern in drum
    c.strokeStyle="rgba(0,0,0,0.1)";c.lineWidth=1;
    c.beginPath();c.moveTo(mx+41,247);c.lineTo(mx+41,277);c.stroke();
    c.beginPath();c.moveTo(mx+26,262);c.lineTo(mx+56,262);c.stroke();
    // Knobs
    c.fillStyle="#999";c.beginPath();c.arc(mx+20,226,3,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(mx+62,226,3,0,Math.PI*2);c.fill();
    SH(c,mx,304,82);
  }
  // Lint monster with eyes and personality
  RR(c,258,268,68,68,8,"#ccc");
  c.fillStyle="#ddd";c.beginPath();c.arc(280,292,28,0,Math.PI*2);c.fill();
  // Fuzzy edges
  for(var f=0;f<12;f++){
    var fa=f*Math.PI*2/12;
    c.fillStyle="rgba(200,200,200,0.5)";c.beginPath();c.arc(280+Math.cos(fa)*26,292+Math.sin(fa)*26,6,0,Math.PI*2);c.fill();
  }
  // Eyes
  c.fillStyle="#333";c.beginPath();c.arc(272,285,4,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(288,285,4,0,Math.PI*2);c.fill();
  c.fillStyle="#fff";c.beginPath();c.arc(273,284,1.5,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(289,284,1.5,0,Math.PI*2);c.fill();
  // Escape door (with handle)
  RR(c,308,148,42,152,4,"#654321");RR(c,312,152,34,144,3,"#7a5a31");
  c.fillStyle=P.gold;c.beginPath();c.arc(340,224,4,0,Math.PI*2);c.fill();
}
function paintShed(c){
  D(c,0,370,360,270,"#3a3020");
  // Dirt floor texture
  for(var i=0;i<12;i++){c.fillStyle="rgba(80,60,30,0.15)";c.beginPath();c.arc(30+rI(300),390+rI(240),4+rI(6),0,Math.PI*2);c.fill();}
  // Wood plank walls
  D(c,0,0,360,370,"#4a3828");
  for(var i=0;i<360;i+=32){D(c,i,0,1,370,"rgba(60,40,24,0.4)");D(c,i+16,0,1,370,"rgba(60,40,24,0.2)");}
  // Knotholes
  c.fillStyle="rgba(30,20,10,0.4)";c.beginPath();c.ellipse(78,120,4,6,0,0,Math.PI*2);c.fill();
  c.beginPath();c.ellipse(250,200,5,4,0.5,0,Math.PI*2);c.fill();
  WF(c,370);
  // Light from doorway
  c.fillStyle="rgba(255,240,200,0.03)";c.fillRect(0,0,60,370);
  // Lawn mower with rounded body
  RR(c,28,308,78,52,6,"#cc0000");
  RR(c,38,296,58,18,4,"#333");
  // Mower wheels
  c.fillStyle="#222";c.beginPath();c.arc(42,362,8,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(92,362,8,0,Math.PI*2);c.fill();
  c.fillStyle="#555";c.beginPath();c.arc(42,362,3,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(92,362,3,0,Math.PI*2);c.fill();
  // Handle
  D(c,60,270,4,30,"#555");D(c,52,266,20,6,"#333");
  SH(c,28,362,78);
  // Garden tools on wall (rake, shovel)
  D(c,150,80,4,260,"#8B6914");D(c,140,72,24,12,"#666");
  // Rake tines
  for(var t=0;t<5;t++){D(c,141+t*4,84,2,12,"#666");}
  D(c,172,100,4,240,"#8B6914");D(c,166,88,16,14,"#888");
  // Flower pot
  c.fillStyle=P.brown;c.beginPath();c.moveTo(258,430);c.lineTo(264,400);c.lineTo(292,400);c.lineTo(298,430);c.closePath();c.fill();
  RR(c,262,396,32,6,2,"#8B6914");
  c.fillStyle=P.green;c.beginPath();c.arc(278,388,10,0,Math.PI*2);c.fill();
  c.fillStyle=P.lgreen;c.beginPath();c.arc(274,382,6,0,Math.PI*2);c.fill();
  // Mysterious tarp
  RR(c,198,218,122,82,6,"#556b2f");
  c.fillStyle="rgba(0,0,0,0.08)";c.fillRect(198,270,122,30);
  c.fillStyle="#333";c.font="7px monospace";c.fillText("(something",210,258);c.fillText("under here)",210,270);
  // Cobwebs in corners
  c.strokeStyle="rgba(200,200,200,0.15)";c.lineWidth=1;
  c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(30,10,50,40);c.stroke();
  c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(10,30,40,50);c.stroke();
  c.beginPath();c.moveTo(360,0);c.quadraticCurveTo(330,10,310,40);c.stroke();
  c.beginPath();c.moveTo(360,0);c.quadraticCurveTo(350,30,320,50);c.stroke();
}
function paintGarden(c){
  // Sky gradient
  var g=c.createLinearGradient(0,0,0,190);g.addColorStop(0,"#5ba3d9");g.addColorStop(1,"#b0e0ff");c.fillStyle=g;c.fillRect(0,0,360,190);
  // Sun with rays
  c.fillStyle="#FFD700";c.beginPath();c.arc(60,50,22,0,Math.PI*2);c.fill();
  c.fillStyle="rgba(255,215,0,0.15)";c.beginPath();c.arc(60,50,35,0,Math.PI*2);c.fill();
  for(var r=0;r<8;r++){var a=r*Math.PI/4;c.strokeStyle="rgba(255,215,0,0.1)";c.lineWidth=2;c.beginPath();c.moveTo(60+Math.cos(a)*30,50+Math.sin(a)*30);c.lineTo(60+Math.cos(a)*48,50+Math.sin(a)*48);c.stroke();}
  // Fluffy clouds
  c.fillStyle="rgba(255,255,255,0.7)";
  c.beginPath();c.arc(200,40,16,0,Math.PI*2);c.arc(220,35,20,0,Math.PI*2);c.arc(240,40,16,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(310,60,12,0,Math.PI*2);c.arc(325,55,15,0,Math.PI*2);c.arc(340,60,12,0,Math.PI*2);c.fill();
  // Ground - rich soil
  var gg=c.createLinearGradient(0,190,0,640);gg.addColorStop(0,"#3a8a2a");gg.addColorStop(1,"#2a6a1a");c.fillStyle=gg;c.fillRect(0,190,360,450);
  // Garden path
  c.fillStyle="rgba(180,160,120,0.3)";c.fillRect(160,190,40,450);
  for(var p=195;p<640;p+=20){c.fillStyle="rgba(160,140,100,0.2)";c.beginPath();c.ellipse(180,p,18,6,0,0,Math.PI*2);c.fill();}
  // Raised garden beds with detail
  for(var b=0;b<3;b++){
    var bx=15+b*118;
    // Bed frame
    RR(c,bx,210,105,75,5,"#3a2010");RR(c,bx+4,214,97,67,3,"#5a3820");
    // Soil
    D(c,bx+4,214,97,67,"#4a3518");
    // Plants in each bed
    for(var pp=0;pp<3;pp++){
      var px=bx+15+pp*32;
      // Stem
      D(c,px+3,222,2,42,"#1a7a1a");
      // Leaves
      c.fillStyle="#2a9a2a";c.beginPath();c.ellipse(px-2,240,5,3,-.4,0,Math.PI*2);c.fill();
      c.beginPath();c.ellipse(px+10,248,5,3,.4,0,Math.PI*2);c.fill();
      // Flower/fruit on top
      var fcol=["#e74c3c","#FFD700","#9b59b6"][pp];
      c.fillStyle=fcol;c.beginPath();c.arc(px+4,218,6,0,Math.PI*2);c.fill();
      c.fillStyle="rgba(255,255,255,0.15)";c.beginPath();c.arc(px+2,216,2,0,Math.PI*2);c.fill();
    }
  }
  // Sunflowers (tall, detailed)
  for(var sf=0;sf<3;sf++){
    var sx=240+sf*38;
    // Stem with leaves
    D(c,sx,230,3,80,P.green);
    c.fillStyle=P.green;c.beginPath();c.ellipse(sx-4,260,6,3,-.3,0,Math.PI*2);c.fill();
    c.beginPath();c.ellipse(sx+7,275,6,3,.3,0,Math.PI*2);c.fill();
    // Petals
    for(var pt=0;pt<8;pt++){
      var pa=pt*Math.PI/4;
      c.fillStyle=P.gold;c.beginPath();c.ellipse(sx+1+Math.cos(pa)*10,226+Math.sin(pa)*10,5,3,pa,0,Math.PI*2);c.fill();
    }
    // Center
    c.fillStyle="#8B6914";c.beginPath();c.arc(sx+1,226,6,0,Math.PI*2);c.fill();
  }
  // Garden gnome (detailed)
  // Body
  c.fillStyle="#e74c3c";c.beginPath();c.moveTo(310,452);c.lineTo(318,420);c.lineTo(330,452);c.closePath();c.fill();
  // Face
  c.fillStyle=P.skin;c.beginPath();c.arc(319,413,7,0,Math.PI*2);c.fill();
  // Hat
  c.fillStyle="#e74c3c";c.beginPath();c.moveTo(312,413);c.lineTo(319,396);c.lineTo(326,413);c.closePath();c.fill();
  // Eyes
  c.fillStyle="#333";c.beginPath();c.arc(316,412,1.2,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(322,412,1.2,0,Math.PI*2);c.fill();
  // Beard
  c.fillStyle="#fff";c.beginPath();c.moveTo(314,417);c.quadraticCurveTo(319,428,324,417);c.fill();
  SH(c,310,452,20);
  // Butterfly
  c.fillStyle="rgba(255,105,180,0.6)";c.beginPath();c.ellipse(150,170,6,4,-0.3,0,Math.PI*2);c.fill();
  c.beginPath();c.ellipse(158,170,6,4,0.3,0,Math.PI*2);c.fill();
  c.fillStyle="#333";c.fillRect(153,168,2,6);
}
function paintGreyson(c){
  D(c,0,370,360,270,"#2a2a3a");
  // Dark floor with slight texture
  for(var i=0;i<360;i+=30)D(c,i,370,1,270,"rgba(0,0,0,0.06)");
  // Dark angled ceiling (attic sub-room)
  c.fillStyle="#1a1a2e";c.beginPath();c.moveTo(0,0);c.lineTo(180,70);c.lineTo(360,0);c.lineTo(360,370);c.lineTo(0,370);c.closePath();c.fill();
  WF(c,370);
  // RGB LED strip along ceiling
  var colors=["#f00","#0f0","#00f","#ff0","#f0f","#0ff"];
  for(var led=0;led<36;led++){
    c.fillStyle=colors[led%6];c.globalAlpha=0.15;c.beginPath();c.arc(5+led*10,70,3,0,Math.PI*2);c.fill();
  }
  c.globalAlpha=1;
  // Triple monitor gaming setup
  RR(c,88,138,184,92,4,"#222");
  // Three screens
  RR(c,92,142,55,84,2,"#0a1a3a");
  RR(c,152,142,55,84,2,"#0a1a3a");
  RR(c,212,142,55,84,2,"#0a1a3a");
  // Screen content - game on main, chat on sides
  D(c,96,150,47,26,"#0f0");c.fillStyle="rgba(0,255,0,0.1)";c.fillRect(96,150,47,26);
  D(c,156,160,47,20,"#333");c.fillStyle="#0ff";c.font="4px monospace";c.fillText("discord",160,172);
  D(c,216,155,47,18,"#f00");c.fillStyle="rgba(255,0,0,0.1)";c.fillRect(216,155,47,18);
  // Monitor stand
  RR(c,165,230,30,8,2,"#333");D(c,177,238,6,20,"#444");RR(c,170,256,20,4,1,"#333");
  // Gaming chair (rounded, fancy)
  RR(c,128,288,104,52,6,"#1a1a1a");
  RR(c,148,272,64,20,4,"#1a1a1a");
  c.fillStyle="#8a2be2";c.fillRect(148,278,4,30);c.fillRect(208,278,4,30);
  // Chair wheels
  for(var w=0;w<3;w++){c.fillStyle="#333";c.beginPath();c.arc(152+w*28,342,4,0,Math.PI*2);c.fill();}
  // Cyberpunk poster with neon border
  RR(c,13,93,58,40,3,"#111");
  c.strokeStyle="#0ff";c.lineWidth=1;c.strokeRect(15,95,54,36);
  c.fillStyle="#0ff";c.font="bold 6px monospace";c.fillText("CYBER",22,112);c.fillText("PUNK",24,122);
  // Anime poster
  RR(c,288,88,58,44,3,"#111");
  c.strokeStyle="#f0f";c.lineWidth=1;c.strokeRect(290,90,54,40);
  c.fillStyle="#f0f";c.font="bold 6px monospace";c.fillText("ANIME",298,114);
  // Energy drink cans (cylindrical look)
  [[262,388,9,18,"#0f0"],[276,390,9,16,"#00f"],[290,386,9,20,"#f00"]].forEach(function(d){
    RR(c,d[0],d[1],d[2],d[3],3,d[4]);
    c.fillStyle="rgba(255,255,255,0.1)";c.fillRect(d[0]+1,d[1],3,d[3]);
  });
  // Skateboard
  RR(c,298,428,44,6,3,"#8a2be2");
  c.fillStyle="#333";c.beginPath();c.arc(306,436,3,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(334,436,3,0,Math.PI*2);c.fill();
  // Headphones on desk
  c.strokeStyle="#333";c.lineWidth=3;c.beginPath();c.arc(104,148,12,Math.PI,2*Math.PI);c.stroke();
  c.fillStyle="#333";c.beginPath();c.arc(92,148,5,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(116,148,5,0,Math.PI*2);c.fill();
}
function paintGwynRoom(c){
  // Cool blue floor
  D(c,0,370,360,270,"#c0d8f0");
  for(var i=0;i<360;i+=40)D(c,i,370,1,270,"rgba(0,0,0,0.03)");
  // Blue-teal walls
  var g=c.createLinearGradient(0,0,0,370);g.addColorStop(0,"#d4eaf8");g.addColorStop(1,"#c0d8f0");c.fillStyle=g;c.fillRect(0,0,360,370);
  WF(c,370);
  // Fairy lights along ceiling (blue/teal themed)
  for(var fl=0;fl<18;fl++){
    var col=["#4169E1","#00CED1","#87CEEB","#9b59b6","#fff"][fl%5];
    var fy=28+Math.sin(fl*0.8)*6;
    if(fl<17){c.strokeStyle="rgba(100,100,100,0.2)";c.lineWidth=1;c.beginPath();c.moveTo(10+fl*19,fy);c.lineTo(10+(fl+1)*19,28+Math.sin((fl+1)*0.8)*6);c.stroke();}
    c.fillStyle=col;c.beginPath();c.arc(10+fl*19,fy,3,0,Math.PI*2);c.fill();
    c.save();c.globalAlpha=0.12;c.fillStyle=col;c.beginPath();c.arc(10+fl*19,fy,8,0,Math.PI*2);c.fill();c.restore();
  }
  // Gwyneth's bed (blue, stylish)
  RR(c,20,268,160,78,5,"#4169E1");
  RR(c,24,266,55,16,4,P.white);RR(c,90,266,55,16,4,P.white);
  // Blue patterned blanket
  c.fillStyle="#1a3a7a";c.fillRect(24,278,152,64);
  // Stars pattern on blanket
  for(var bs2=0;bs2<6;bs2++){c.fillStyle="rgba(135,206,235,0.3)";c.beginPath();c.arc(40+bs2*24,310,4,0,Math.PI*2);c.fill();}
  // Book on pillow (she fell asleep reading)
  RR(c,55,263,24,12,2,"#e74c3c");c.fillStyle="#c0392b";c.font="5px monospace";c.fillText("READ",58,273);
  c.fillStyle="#4169E1";c.font="bold 6px monospace";c.fillText("GWYNETH",50,326);
  SH(c,20,348,160);
  // Fashion sketches on floor (scattered)
  [[10,400,"#fff"],[35,415,"#ffe"],[55,395,"#fff"]].forEach(function(p){
    RR(c,p[0],p[1],22,28,2,p[2]);
    c.strokeStyle="rgba(65,105,225,0.3)";c.lineWidth=0.8;
    c.beginPath();c.moveTo(p[0]+4,p[1]+6);c.lineTo(p[0]+18,p[1]+6);c.stroke();
    c.beginPath();c.moveTo(p[0]+4,p[1]+12);c.lineTo(p[0]+14,p[1]+12);c.stroke();
    c.beginPath();c.moveTo(p[0]+4,p[1]+18);c.lineTo(p[0]+16,p[1]+18);c.stroke();
  });
  // Books EVERYWHERE (stylish chaos)
  var bookCols=["#e74c3c","#3498db","#2ecc71","#9b59b6","#FF8C00","#4169E1","#FFD700"];
  var bkPiles=[[200,380],[220,385],[240,375],[260,390],[280,382],[300,378],[185,400],[310,395]];
  bkPiles.forEach(function(bp,bi){RR(c,bp[0],bp[1],14+rI(6),8+rI(4),1,bookCols[bi%7]);});
  // Tall book stack
  for(var bk=0;bk<5;bk++){RR(c,80+bk*2,360+bk*2,16,24-bk*3,2,bookCols[bk]);}
  // Vanity with mirror and accessories
  RR(c,248,148,100,68,5,"#b0c8e0");
  // Vanity mirror (round, blue frame)
  c.fillStyle="#4169E1";c.beginPath();c.arc(318,130,30,0,Math.PI*2);c.fill();
  c.fillStyle="#d4eaf8";c.beginPath();c.arc(318,130,26,0,Math.PI*2);c.fill();
  c.fillStyle="rgba(255,255,255,0.1)";c.beginPath();c.arc(311,124,10,0,Math.PI*2);c.fill();
  // Blue hair accessories
  D(c,255,158,4,10,"#4169E1");D(c,263,160,4,8,"#00CED1");D(c,271,159,4,9,"#9b59b6");
  // Hair brush
  RR(c,280,162,24,6,2,"#4169E1");
  // Sewing machine corner
  RR(c,270,398,58,34,4,"#444");RR(c,274,393,36,8,3,"#333");
  D(c,282,404,22,2,"#888");// needle/arm
  c.fillStyle=P.white;c.beginPath();c.arc(308,410,6,0,Math.PI*2);c.fill();// spool
  c.fillStyle="#4169E1";c.font="6px monospace";c.fillText("SEW",280,430);
  // Stuffed animal (blue bear)
  c.fillStyle="#4169E1";c.beginPath();c.arc(162,418,10,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(155,410,4,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(169,410,4,0,Math.PI*2);c.fill();
  c.fillStyle="#1a3a7a";c.beginPath();c.arc(159,416,1.5,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(165,416,1.5,0,Math.PI*2);c.fill();
  // Art on wall
  RR(c,35,50,62,50,3,"#fff");
  c.strokeStyle="#4169E1";c.lineWidth=2;c.strokeRect(37,52,58,46);
  c.fillStyle="#4169E1";c.font="bold 5px monospace";c.fillText("FASHION",44,68);c.fillText("WEEK",46,78);c.fillText("2025",50,88);
  // Rug (blue ellipse)
  c.save();c.globalAlpha=0.25;c.fillStyle="#4169E1";c.beginPath();c.ellipse(140,440,80,28,0,0,Math.PI*2);c.fill();c.restore();
  c.strokeStyle="rgba(65,105,225,0.35)";c.lineWidth=2;c.beginPath();c.ellipse(140,440,80,28,0,0,Math.PI*2);c.stroke();
}
function paintForest(c){
  // Dark gamer den atmosphere
  D(c,0,370,360,270,"#0a0a18");
  for(var i=0;i<360;i+=30)D(c,i,370,1,270,"rgba(0,0,50,0.08)");
  D(c,0,0,360,370,"#0d0d20");
  WF(c,370);
  // Blue LED ambient glow from gaming setup
  c.fillStyle="rgba(0,100,255,0.04)";c.fillRect(0,0,360,640);
  var ledGlow=c.createRadialGradient(185,230,10,185,230,140);
  ledGlow.addColorStop(0,"rgba(30,80,255,0.12)");ledGlow.addColorStop(1,"rgba(0,0,0,0)");
  c.fillStyle=ledGlow;c.fillRect(0,0,360,640);
  // LED strips along ceiling
  var ledColors=["#0044ff","#0088ff","#00ccff","#00ffff","#0088ff","#0044ff"];
  for(var led=0;led<36;led++){
    c.fillStyle=ledColors[led%6];c.save();c.globalAlpha=0.25;
    c.beginPath();c.arc(5+led*10,12,2.5,0,Math.PI*2);c.fill();c.restore();
  }
  // Door area (left wall) with WARNING signs
  D(c,8,80,55,260,P.dbrown);var pg=c.createLinearGradient(12,0,58,0);pg.addColorStop(0,"#1a1a1a");pg.addColorStop(1,"#2a2a2a");c.fillStyle=pg;c.fillRect(12,85,48,250);
  // Door signs
  var signs=[["QUARANTINE",60,"#e74c3c"],["GO AWAY",74,"#FFD700"],["LOADING...",88,"#00CED1"],["DO NOT",102,"#FF69B4"],["DISTURB",113,"#FF69B4"]];
  signs.forEach(function(s){
    c.fillStyle=s[2];c.font="bold 5px monospace";c.fillText(s[0],14,s[1]);
  });
  // Biohazard symbol
  c.fillStyle="rgba(255,215,0,0.4)";c.font="12px monospace";c.fillText("\u2622",22,142);
  // Main gaming setup — MASSIVE PC rig
  RR(c,100,100,220,210,6,"#111");
  RR(c,104,104,212,202,4,"#0a0a20");
  // Triple ultrawide monitors
  RR(c,108,108,205,110,4,"#1a1a3a");
  // Center monitor (main game)
  var mg=c.createRadialGradient(210,163,5,210,163,60);mg.addColorStop(0,"#002266");mg.addColorStop(1,"#000a1a");c.fillStyle=mg;c.fillRect(112,112,198,102);
  // Game HUD elements on screen
  c.fillStyle="rgba(0,200,100,0.4)";c.fillRect(114,114,40,6);
  c.fillStyle="rgba(255,50,50,0.3)";c.fillRect(258,114,48,6);
  c.fillStyle="rgba(0,150,255,0.2)";c.fillRect(160,200,80,10);
  // Score / fps counter
  c.fillStyle="rgba(0,255,0,0.5)";c.font="5px monospace";c.fillText("144 FPS",280,122);
  // Keyboard glow
  RR(c,118,232,160,28,3,"#0a0a1a");
  for(var k=0;k<12;k++)for(var kr=0;kr<4;kr++){
    var kc=["rgba(0,80,255,0.3)","rgba(0,200,200,0.2)","rgba(255,0,100,0.2)"][Math.floor(Math.random()*3)];
    RR(c,120+k*13,234+kr*6,11,5,1,kc);
  }
  // THE BUBBLE (clear dome gaming chair enclosure)
  c.save();c.globalAlpha=0.15;c.fillStyle="#88aaff";
  c.beginPath();c.ellipse(185,340,75,55,0,0,Math.PI*2);c.fill();c.restore();
  c.strokeStyle="rgba(100,150,255,0.4)";c.lineWidth=2;
  c.beginPath();c.ellipse(185,340,75,55,0,0,Math.PI*2);c.stroke();
  // Bubble highlight
  c.save();c.globalAlpha=0.08;c.fillStyle="#fff";
  c.beginPath();c.ellipse(160,315,35,20,-.4,0,Math.PI*2);c.fill();c.restore();
  // Forest inside bubble — gaming chair + headphones
  RR(c,158,315,55,42,6,"#1a1a2e");// chair back
  RR(c,162,340,47,20,4,"#1a1a2e");// seat
  // Forest's head (headphones, focused)
  c.fillStyle=P.skin;c.beginPath();c.arc(185,312,9,0,Math.PI*2);c.fill();
  c.fillStyle="#F0E68C";c.beginPath();c.arc(185,306,9,Math.PI,2*Math.PI);c.fill();
  // Headphones
  c.strokeStyle="#222";c.lineWidth=4;c.beginPath();c.arc(185,310,11,Math.PI,2*Math.PI);c.stroke();
  c.fillStyle="#333";c.beginPath();c.arc(174,310,5,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(196,310,5,0,Math.PI*2);c.fill();
  // Eyes (focused on screen)
  c.fillStyle="#333";c.fillRect(182,312,2,2);c.fillRect(187,312,2,2);
  // LED accent on chair
  c.fillStyle="rgba(0,100,255,0.6)";c.fillRect(158,338,2,20);c.fillRect(211,338,2,20);
  // Snack wrappers EVERYWHERE
  var snacks=[
    [90,400,"#e74c3c","CHIPS"],[140,420,"#FFD700","SNAX"],[85,450,"#3498db","PWR"],
    [240,395,"#2ecc71","GUM"],[285,415,"#9b59b6","BARS"],[310,440,"#FF8C00","CRNCH"],
    [160,460,"#e74c3c","CHIPS"],[200,435,"#00CED1","DRNK"],[245,460,"#FFD700","SNAX"],
    [120,480,"#9b59b6","MNCH"],[280,470,"#3498db","GULP"],[335,450,"#FF69B4","PUFFS"]
  ];
  snacks.forEach(function(s){
    RR(c,s[0],s[1],24,12,2,s[3]?s[0]%2===0?"rgba("+parseInt(s[2].slice(1,3),16)+","+parseInt(s[2].slice(3,5),16)+","+parseInt(s[2].slice(5,7),16)+",0.7)":s[2]:s[2]);
    c.fillStyle="rgba(255,255,255,0.5)";c.font="4px monospace";c.fillText(s[3]||"",s[0]+3,s[1]+8);
  });
  // Empty energy drink cans (cylindrical)
  [[106,370,9,20,"#0f0"],[122,375,9,18,"#00f"],[138,368,9,22,"#f00"],[290,365,9,20,"#FFD700"]].forEach(function(d){
    RR(c,d[0],d[1],d[2],d[3],3,d[4]);
    c.fillStyle="rgba(255,255,255,0.1)";c.fillRect(d[0]+1,d[1],3,d[3]);
  });
  // Dark window
  RR(c,290,50,58,60,3,"#0a0a18");
  c.fillStyle="rgba(255,255,255,0.15)";c.beginPath();c.arc(308,68,1,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(325,62,1.2,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(338,75,0.8,0,Math.PI*2);c.fill();
  // "DO NOT DISTURB - I MEAN IT" sign on bubble
  RR(c,118,358,136,12,3,"rgba(255,50,50,0.2)");
  c.fillStyle="#e74c3c";c.font="bold 5px monospace";c.textAlign="center";
  c.fillText("[ DO NOT DISTURB — I MEAN IT ]",186,368);c.textAlign="left";
}

var ROOMS=[
  {name:"THE FOYER",bg:paintFoyer},{name:"THE KITCHEN",bg:paintKitchen},{name:"LIVING ROOM",bg:paintLiving},
  {name:"KIDS' ROOM",bg:paintKids},{name:"BATHROOM",bg:paintBathroom},{name:"THE GARAGE",bg:paintGarage},
  {name:"LAUNDRY",bg:paintLaundry},{name:"BACKYARD",bg:paintBackyard},{name:"THE ATTIC",bg:paintAttic},
  {name:"MASTER BEDROOM",bg:paintBedroom},{name:"JESUS BATHROOM",bg:paintJesusBathroom},{name:"THE BASEMENT",bg:paintBasement},
  {name:"ATTIC GYM",bg:paintAtticGym},{name:"THE PANTRY",bg:paintPantry},{name:"LAUNDRY MAZE B1",bg:paintLM1},
  {name:"LAUNDRY MAZE B2",bg:paintLM2},{name:"LAUNDRY MAZE B3",bg:paintLM3},{name:"THE SHED",bg:paintShed},
  {name:"THE GARDEN",bg:paintGarden},{name:"GREYSON'S ROOM",bg:paintGreyson},{name:"GWYNETH'S ROOM",bg:paintGwynRoom},
  {name:"FOREST'S DEN",bg:paintForest}
];

function makeHS(){return[
// Room 0: Foyer — mirror moved left, upstairs added
[{id:"fdoor",x:120,y:60,w:120,h:280,name:"Front Door",look:"Locked. You need keys.",open:"LOCKED."},{id:"shoes",x:260,y:435,w:60,h:35,name:"Shoe Pile",look:"Chaotic. None match.",push:"Cheerio rolls out."},{id:"coat",x:68,y:140,w:35,h:70,name:"Coat Rack",look:"Two coats, something alive.",use:"Gum wrapper and lint."},{id:"mirror",x:15,y:138,w:44,h:57,name:"Mirror",look:"Needs coffee. And keys.",talk:"'Have fun, don't die.'"},{id:"plant",x:295,y:340,w:45,h:60,name:"Suspicious Plant",look:"Thrives on chaos.",push:"A KEY falls out!",hasKey:true},{id:"fmat",x:140,y:475,w:80,h:25,name:"Welcome Mat",look:"WELCOME. Ironic.",push:"Dead bug and disappointment."},{id:"stairs",x:140,y:505,w:80,h:48,name:"Stairs Down",look:"Dark stairs descending.",open:"goto:11"},{id:"ustairsF",x:280,y:195,w:70,h:165,name:"Upstairs",look:"Stairs going up to the bedroom.",open:"goto:9"},{id:"doorL",x:0,y:120,w:75,h:240,name:"Kitchen",open:"goto:1"},{id:"doorR",x:287,y:120,w:73,h:240,name:"Living Room",open:"goto:2"},{id:"jbdoor",x:0,y:430,w:30,h:90,name:"Jesus Bathroom",open:"goto:10"}],
[{id:"stove",x:110,y:155,w:115,h:65,name:"Stove",look:"All burners on. Nothing cooking.",use:"Turns off burners. Safety first."},{id:"fridge",x:275,y:78,w:78,h:195,name:"Fridge",look:"Kids' drawings. Expired coupons.",open:"Mystery leftovers. One sad yogurt."},{id:"sink",x:10,y:245,w:80,h:55,name:"Sink",look:"Full of dishes. Always.",use:"Rubber duck floats up."},{id:"banana",x:235,y:258,w:25,h:12,name:"Banana",look:"Groundbreaking.",take:"Takes it. For scale.",quest:"banana"},{id:"cab",x:8,y:15,w:345,h:80,name:"Cabinets",look:"Mismatched Tupperware.",open:"Avalanche of containers!"},{id:"kdoorL",x:0,y:300,w:14,h:200,name:"Foyer",open:"goto:0"},{id:"kdoorR",x:346,y:300,w:14,h:200,name:"Laundry",open:"goto:6"},{id:"pantry",x:160,y:320,w:50,h:40,name:"Pantry",open:"goto:13"}],
[{id:"tv",x:100,y:55,w:165,h:125,name:"TV",look:"Nobody watching. Remote MIA.",use:"Volume to 100. Neighbor's cat yowls in response."},{id:"couch",x:16,y:355,w:232,h:70,name:"Couch",look:"More pillow than couch.",push:"ALL pillows moved. Remote AND a KEY!",hasKey:true},{id:"bookshelf",x:268,y:95,w:85,h:230,name:"Bookshelf",look:"Unread since 2018.",take:"'Parenting Without Losing Your Mind.'"},{id:"lamp",x:245,y:280,w:35,h:70,name:"Lamp",look:"Only approved light.",push:"LEGO rolls out."},{id:"rug",x:60,y:435,w:200,h:50,name:"Rug",look:"Hides crumbs.",push:"Cheerios, crayon, Monopoly house."},{id:"ldoorL",x:0,y:260,w:14,h:200,name:"Foyer",open:"goto:0"},{id:"ldoorR",x:346,y:260,w:14,h:200,name:"Kids' Room",open:"goto:3"}],
[{id:"bunk",x:8,y:135,w:115,h:230,name:"Bunk Bed",look:"Top: fort. Bottom: stuffed animals.",open:"Half-eaten granola bar."},{id:"toybox",x:135,y:410,w:75,h:55,name:"Toy Box",look:"90% random objects.",open:"Avalanche of action figures."},{id:"lego",x:170,y:465,w:180,h:45,name:"LEGO Minefield",look:"Colorful landmines.",push:"OW. OWWW."},{id:"dino",x:298,y:395,w:35,h:45,name:"Mr. Rex",look:"Kids say he's real.",talk:"'Keys are in the garage.'"},{id:"poster",x:178,y:55,w:68,h:60,name:"Poster",look:"GAME OVER. Ominous."},{id:"desk",x:218,y:215,w:135,h:110,name:"Desk",look:"Crayon drawings.",open:"'Mom But Cool.'"},{id:"kdoorL",x:0,y:260,w:14,h:200,name:"Living Room",open:"goto:2"},{id:"kdoorR",x:346,y:260,w:14,h:200,name:"Bathroom",open:"goto:4"}],
[{id:"tub",x:5,y:285,w:190,h:85,name:"Bathtub",look:"Five ducks stare back.",talk:"'Where are my keys?' Silence."},{id:"ducks",x:22,y:295,w:140,h:20,name:"Duck Army",look:"General Quackers sees all.",take:"Takes General Quackers.",quest:"duck"},{id:"toilet",x:216,y:305,w:55,h:70,name:"Toilet",look:"Kids say haunted.",open:"Just a toilet."},{id:"bsink",x:276,y:265,w:75,h:40,name:"Sink",look:"Toothpaste EVERYWHERE.",use:"Toy boat surfaces."},{id:"towel",x:162,y:125,w:42,h:80,name:"Towel",look:"Seen better days.",take:"Grabs it."},{id:"bdoorL",x:0,y:260,w:14,h:200,name:"Kids' Room",open:"goto:3"},{id:"bdoorR",x:346,y:260,w:14,h:200,name:"Garage",open:"goto:5"}],
[{id:"gdoor",x:70,y:25,w:220,h:310,name:"Garage Door",look:"Stuck since 2022.",open:"Still stuck."},{id:"bench",x:8,y:160,w:58,h:60,name:"Workbench",look:"Tools and abandoned ambition.",use:"Finds a flashlight!",quest:"flashlight"},{id:"car",x:25,y:375,w:145,h:70,name:"'85 Corvette",look:"Golden beauty.",push:"Behind it: a KEY in a coffee can!",hasKey:true},{id:"boxes",x:308,y:135,w:45,h:45,name:"Boxes",look:"'STUFF.' 3 moves ago.",open:"Christmas decs from 2017."},{id:"tools",x:10,y:160,w:60,h:55,name:"Tools",look:"Hammers, wrenches.",take:"Takes the wrench."},{id:"gdoorL",x:0,y:380,w:14,h:150,name:"Bathroom",open:"goto:4"},{id:"gdoorR",x:346,y:380,w:14,h:150,name:"Backyard",open:"goto:7"}],
[{id:"washer",x:10,y:205,w:100,h:120,name:"Washer",look:"Running. Always.",open:"One sock."},{id:"dryer",x:120,y:205,w:100,h:120,name:"Dryer",look:"Lavender and regret.",open:"Three socks. None match."},{id:"laundry",x:225,y:355,w:128,h:125,name:"Mt. Washmore",look:"Sentient laundry.",push:"Missing homework."},{id:"iron",x:275,y:335,w:45,h:18,name:"Iron",look:"Last used 2021.",use:"Too much commitment."},{id:"shelf",x:236,y:44,w:115,h:48,name:"Shelf",look:"Almost empty bottles.",take:"Grabs tide pen."},{id:"ldoorB",x:0,y:260,w:14,h:200,name:"Kitchen",open:"goto:1"},{id:"mazedoor",x:346,y:380,w:14,h:150,name:"Strange Door",look:"Goes... down?",open:"goto:14"}],
[{id:"tree",x:28,y:80,w:45,h:200,name:"Oak Tree",look:"Treehouse 'in progress' 2 years.",talk:"Talks to the tree."},{id:"cat",x:225,y:400,w:45,h:38,name:"Neighbor's Cat",look:"Judging everyone from next door. Again.",talk:"*slow blink* This cat owns all it surveys.",use:"Cat stares. Unmoving. Untouched."},{id:"hole",x:136,y:445,w:42,h:18,name:"Hole",look:"Someone dug this. Mysterious.",push:"Dirt, a toy car, and something sparkly."},{id:"bbq",x:296,y:375,w:42,h:42,name:"BBQ",look:"Sacred grill.",open:"Old coals."},{id:"fence",x:0,y:222,w:360,h:48,name:"Fence",look:"Keeps the cat out. Theoretically. It doesn't."},{id:"bdoorB",x:0,y:310,w:14,h:200,name:"Garage",open:"goto:5"},{id:"bdoorA",x:346,y:100,w:14,h:120,name:"Attic",open:"goto:8"},{id:"shed",x:100,y:340,w:70,h:55,name:"Shed",open:"goto:17"},{id:"garden",x:270,y:490,w:80,h:50,name:"Garden",open:"goto:18"}],
[{id:"xmas",x:15,y:315,w:60,h:45,name:"Xmas Box",look:"Tinsel entity.",open:"Tangled lights."},{id:"myst",x:80,y:305,w:55,h:55,name:"Mystery Box",look:"Nobody remembers this.",open:"Photo albums! VHS: DO NOT WATCH."},{id:"mirror2",x:130,y:155,w:60,h:80,name:"Old Mirror",look:"Spookier K'Dee.",talk:"Mirror-K'Dee winks."},{id:"trunk",x:255,y:335,w:85,h:30,name:"Trunk",look:"Locked. Treasure or taxes.",open:"Locked!",use:"Wrench opens it: old curtains."},{id:"crystal",x:310,y:300,w:35,h:35,name:"Crystal Ball",look:"Halloween 2022.",talk:"'Check the bedroom, dummy.'"},{id:"adoorB",x:0,y:370,w:14,h:150,name:"Backyard",open:"goto:7"},{id:"adoorR",x:346,y:370,w:14,h:150,name:"Bedroom",open:"goto:9"},{id:"gymdoor",x:200,y:365,w:50,h:30,name:"Gym",open:"goto:12"},{id:"gdoor",x:100,y:365,w:60,h:30,name:"Greyson's",open:"goto:19"}],
[{id:"bed",x:12,y:255,w:215,h:95,name:"Bed",look:"Made this morning. Clothes pile using it as a base camp.",push:"More clothes. Not what you need."},{id:"clothespile",x:38,y:465,w:105,h:60,name:"Clothes Mountain",look:"Mt. Washmore's bedroom cousin. Phone is definitely in here.",push:"K'Dee digs in. Found it! The phone was right in the middle!",take:"Digs out the phone from the pile!",quest:"phone"},{id:"nightstand",x:232,y:305,w:55,h:60,name:"Nightstand",look:"Book page 12 for 6 months.",open:"Charger #3, melatonin, and a KEY!",hasKey:true},{id:"vanity",x:238,y:205,w:115,h:65,name:"Vanity",look:"Lipstick, mascara, dry shampoo.",use:"Hair ties, bobby pins."},{id:"vmirror",x:258,y:130,w:75,h:65,name:"Mirror",look:"Survived another morning.",talk:"'Have fun, don't die.'"},{id:"window",x:95,y:30,w:115,h:100,name:"Window",look:"Neighbor's cat is staring in. Judging.",open:"'MOM!' from downstairs."},{id:"closet",x:307,y:95,w:52,h:135,name:"Closet",look:"Overflow situation. Two more piles fell out.",open:"An avalanche of shirts and regret."},{id:"flowers",x:248,y:190,w:22,h:22,name:"Flowers",look:"Self-care purchase.",take:"Smells nice."},{id:"bdoorL",x:0,y:270,w:14,h:200,name:"Attic",open:"goto:8"},{id:"forestdoor",x:346,y:270,w:14,h:200,name:"Forest's Den",open:"goto:21"}],
[{id:"jcross",x:40,y:45,w:60,h:80,name:"Cross",look:"Holy energy.",talk:"K'Dee prays. Warm light."},{id:"jbattle",x:10,y:35,w:105,h:125,name:"Space Jesus vs Devil",look:"A painting of Space Jesus locked in battle with the Devil. Among the stars. It's intense.",talk:"The figures in the painting seem to move. Space Jesus winks."},{id:"jpinup",x:245,y:35,w:105,h:125,name:"Rescued by Grace",look:"Jesus pulls a glamorous pinup girl out of the ocean. She looks delighted. Her red lipstick is perfect somehow.",talk:"The pinup girl waves from the painting. K'Dee waves back. This bathroom is a LOT."},{id:"jport",x:142,y:36,w:75,h:105,name:"Jesus Portrait",look:"Kind smile. Halo. He seems like he's about to step out.",talk:"'Seen my keys?' The smile widens."},{id:"jtub",x:10,y:285,w:178,h:80,name:"Golden Tub",look:"Pure gold. Holy water.",use:"Hand sparkles."},{id:"jbible",x:150,y:225,w:52,h:32,name:"Bible",look:"Proverbs 31.",take:"'Divine guidance.'",quest:"bible"},{id:"jtoilet",x:270,y:305,w:60,h:65,name:"Golden Toilet",look:"Jesus saves, bathroom SPENDS.",use:"Not that throne."},{id:"jcandles",x:315,y:205,w:35,h:38,name:"Candles",look:"Frankincense."},{id:"jdoorB",x:346,y:270,w:14,h:200,name:"Foyer",open:"goto:0"}],
[{id:"penta",x:136,y:416,w:88,h:88,name:"Pentagram",look:"NOT home decor.",use:"Flames flare! Then nothing.",push:"Chalk smudges."},{id:"necro",x:45,y:435,w:42,h:26,name:"Necronomicon",look:"It whispers.",take:"'...return me.'",quest:"necronomicon",talk:"'Keys are not here, mortal.'"},{id:"skull",x:296,y:435,w:22,h:22,name:"Skull",look:"Real or prop?",talk:"'Alas, poor Yorick.'"},{id:"chains",x:10,y:85,w:30,h:120,name:"Chains",look:"Rusty. HISTORY.",use:"Echo: 10/10."},{id:"bstairsU",x:100,y:0,w:160,h:30,name:"Stairs Up",open:"goto:0"},{id:"hgdoor",x:346,y:270,w:14,h:200,name:"Girls' Room",open:"goto:20"}],
[{id:"bench",x:25,y:272,w:120,h:65,name:"Bench Press",look:"Gains.",use:"Half a rep."},{id:"dumbbells",x:160,y:420,w:50,h:22,name:"Dumbbells",look:"Heavy.",take:"Almost lifts one."},{id:"gymmirror",x:85,y:125,w:185,h:115,name:"Mirror",look:"Looking STRONG.",talk:"'Find keys AND look great.'"},{id:"poster",x:278,y:105,w:72,h:55,name:"Poster",look:"NO PAIN NO GAIN."},{id:"pullup",x:262,y:98,w:85,h:55,name:"Pull-Up Bar",use:"3 seconds. Record."},{id:"mat",x:125,y:395,w:105,h:30,name:"Yoga Mat",use:"Namaste."},{id:"gymdoorB",x:0,y:370,w:14,h:150,name:"Attic",open:"goto:8"}],
[{id:"shelves",x:8,y:15,w:344,h:350,name:"Shelves",look:"Expired 2022.",open:"Beans, mystery powder."},{id:"rice",x:276,y:325,w:65,h:45,name:"Rice Bag",look:"50 pounds.",push:"A map drawing!",take:"Too heavy."},{id:"pdoorB",x:0,y:270,w:14,h:200,name:"Kitchen",open:"goto:1"}],
[{id:"breakers",x:136,y:50,w:85,h:80,name:"Breakers",look:"Half tripped.",use:"Lights flicker!"},{id:"washers",x:5,y:195,w:350,h:120,name:"Machines",look:"EIGHT. WHY.",open:"One sock."},{id:"maze1R",x:346,y:270,w:14,h:200,name:"Deeper",open:"goto:15"},{id:"maze1L",x:0,y:270,w:14,h:200,name:"Laundry",open:"goto:6"}],
[{id:"sign",x:55,y:75,w:250,h:42,name:"Sign",look:"YOU ARE HERE... OR ARE YOU?"},{id:"morewash",x:5,y:225,w:350,h:95,name:"More Machines",look:"Laundry DIMENSION.",open:"47 socks. 0 matches."},{id:"maze2R",x:346,y:270,w:14,h:200,name:"Deeper",open:"goto:16"},{id:"maze2L",x:0,y:270,w:14,h:200,name:"Back",open:"goto:14"}],
[{id:"exit",x:126,y:15,w:108,h:32,name:"EXIT",look:"Can you trust it?"},{id:"lint",x:255,y:265,w:70,h:70,name:"Lint Monster",look:"Dryer lint with EYES.",talk:"*rustles*",push:"Reforms. ALWAYS.",use:"Dryer sheet: it HISSES!"},{id:"escape",x:306,y:145,w:45,h:155,name:"Escape Door",open:"goto:6"},{id:"maze3L",x:0,y:270,w:14,h:200,name:"Back",open:"goto:15"}],
[{id:"mower",x:25,y:305,w:80,h:55,name:"Mower",look:"Grass was waist-high.",use:"Pull cord. Nothing."},{id:"tools2",x:145,y:75,w:35,h:265,name:"Tools",look:"Rakes, shovels.",take:"Takes shovel.",quest:"shovel"},{id:"tarp",x:195,y:215,w:125,h:85,name:"Tarp",look:"Something BIG.",push:"Holiday decorations."},{id:"pots",x:255,y:395,w:40,h:35,name:"Pots",look:"Dead plants.",push:"Dirt and regret."},{id:"sheddoorB",x:0,y:370,w:14,h:150,name:"Backyard",open:"goto:7"}],
[{id:"beds",x:10,y:205,w:350,h:82,name:"Garden Beds",look:"Tomatoes, herbs.",take:"Herbs for dinner."},{id:"sunflowers",x:236,y:222,w:118,h:85,name:"Sunflowers",look:"Majestic.",talk:"They lean toward her."},{id:"gnome",x:306,y:405,w:28,h:42,name:"Gnome",look:"Creepy smile. Watching.",talk:"'You know where the keys are.'",push:"Note: CHECK THE COUCH."},{id:"gardendoorB",x:0,y:200,w:14,h:300,name:"Backyard",open:"goto:7"}],
[{id:"gpc",x:85,y:135,w:190,h:95,name:"Gaming PC",look:"Triple monitors. RGB.",use:"Game unpauses. Panic.",talk:"Discord tab closed."},{id:"gchair",x:125,y:285,w:110,h:55,name:"Chair",look:"Cost more than couch.",use:"Comfortable."},{id:"gposter1",x:10,y:90,w:60,h:42,name:"Cyberpunk",look:"Thinks he's a hacker."},{id:"gposter2",x:286,y:85,w:60,h:46,name:"Anime",look:"Nods approvingly."},{id:"drinks",x:258,y:385,w:40,h:25,name:"Energy Drinks",look:"Three empty. 3AM gaming.",take:"Confiscated."},{id:"board",x:296,y:425,w:48,h:12,name:"Skateboard",use:"Slides 3 feet. Regret."},{id:"groomdoorB",x:0,y:370,w:14,h:150,name:"Attic",open:"goto:8"}],
// Room 20: Gwyneth's stylish blue room
[{id:"gwbed",x:18,y:265,w:165,h:82,name:"Gwyneth's Bed",look:"Books on both pillows. She fell asleep reading. Again.",open:"'Reading is my superpower.' A book falls out. It was open to the last page."},{id:"hgvanity",x:246,y:145,w:102,h:72,name:"Vanity",look:"Lip gloss, hair dye, blue accessories everywhere.",use:"Borrows some blue eyeliner. Shhh."},{id:"fairy",x:0,y:18,w:360,h:28,name:"Fairy Lights",look:"Blue and teal. Magical.",use:"Disco mode activated."},{id:"stuffed",x:150,y:410,w:28,h:26,name:"Blue Bear",look:"Gwyneth's companion since age 4. Judges no one.",talk:"Mr. Blue-Bear has seen some things. He's at peace."},{id:"art",x:33,y:47,w:64,h:53,name:"Fashion Art",look:"Fashion Week 2025. K'Dee nods approvingly.",talk:"Gwyneth wants to be a designer. Obviously."},{id:"books",x:188,y:375,w:150,h:55,name:"Book Pile",look:"At least 40 books. All read multiple times.",open:"Fantasy, fashion history, and one suspiciously thick manga."},{id:"sewing",x:268,y:395,w:62,h:38,name:"Sewing Machine",look:"Mid-project. Blue fabric everywhere.",use:"One needle stuck in the fabric. K'Dee leaves it alone."},{id:"hgroomdoorB",x:0,y:370,w:14,h:150,name:"Basement",open:"goto:11"}],
// Room 21: Forest's gamer bubble den
[{id:"bubble",x:110,y:285,w:150,h:100,name:"Gaming Bubble",look:"A sealed dome around his gaming setup. This is where he lives now.",talk:"*typing through glass* '...what.'"},{id:"snacks",x:82,y:360,w:72,h:42,name:"Snack Pile",look:"Six empty energy drink cans and 12 wrappers. He's been here a while.",take:"Confiscated snacks."},{id:"signs",x:12,y:78,w:52,h:70,name:"Door Signs",look:"QUARANTINE. GO AWAY. LOADING... DO NOT DISTURB — I MEAN IT. Biohazard symbol.",talk:"K'Dee knocks. A long pause. 'I SAID LOADING.'"},{id:"gpc2",x:100,y:100,w:220,h:215,name:"Gaming Setup",look:"Bigger than Greyson's. LED everywhere. He will NOT let you touch it.",use:"K'Dee accidentally moves a cable. Forest's reaction is INSTANT."},{id:"froomdoorB",x:0,y:270,w:14,h:200,name:"Bedroom",open:"goto:9"}]
];}
