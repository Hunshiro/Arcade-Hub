
import React, { useState, useEffect, useCallback } from 'react';
import { Game, GameEvent, LeaderboardEntry, User } from './types';
import { getMe, joinRoom as joinRoomApi, createRoomForGame } from './services/api';
import { joinRoomSocket, leaveRoomSocket } from './services/socketClient';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import GamePlayer from './components/GamePlayer';
import EventsList from './components/EventsList';
import LeaderboardView from './components/LeaderboardView';
import UploadModal from './components/UploadModal';
import AIStudio from './components/AIStudio';
import LandingPage from './components/LandingPage';
import SignIn from './components/SignIn';

const INITIAL_GAMES: Game[] = [
  {
    id: '1',
    title: 'Neon Runner',
    description: 'A fast-paced dodge-and-dash game set in a synthwave world.',
    author: 'ArcadeAdmin',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400',
    category: 'Action',
    mode: 'solo',
    createdAt: Date.now(),
    htmlContent: `
      <!DOCTYPE html><html><body style="background:#000;color:#0f0;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;overflow:hidden">
      <h1 id="score" style="position:fixed;top:10px;left:10px;margin:0">Score: 0</h1>
      <canvas id="g" width="800" height="600" style="background:#111;max-width:95vw;max-height:95vh"></canvas>
      <script>
        const c=document.getElementById('g'),ctx=c.getContext('2d');
        let s=0,px=400,py=550,o=[],t=0;
        function update(){
          ctx.fillStyle='#000';ctx.fillRect(0,0,800,600);
          ctx.fillStyle='#0f0';ctx.fillRect(px-20,py-20,40,40);
          if(t%20==0)o.push({x:Math.random()*800,y:0,w:Math.random()*40+20});
          o.forEach((e,i)=>{
            e.y+=7;ctx.fillStyle='#f0f';ctx.fillRect(e.x-e.w/2,e.y-10,e.w,20);
            if(Math.hypot(px-e.x,py-e.y)<35){alert('Game Over! Score: '+s);window.parent.postMessage({type:'SCORE_UPDATE',score:s},'*');s=0;o=[];}
            if(e.y>600){o.splice(i,1);s++;document.getElementById('score').innerText='Score: '+s;}
          });
          t++;requestAnimationFrame(update);
        }
        window.onmousemove=e=>{const r=c.getBoundingClientRect();px=(e.clientX-r.left)*(800/r.width);};
        update();
      </script></body></html>`
  },
  {
    id: '2',
    title: 'Pixel Pong Duel',
    description: 'Two-player classic Pong. Player 1: W/S. Player 2: ↑/↓. First to 7 wins.',
    author: 'ArcadeAdmin',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=400',
    category: 'Two Player',
    mode: 'two-player',
    createdAt: Date.now(),
    htmlContent: `
      <!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#0b1020;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh">
      <canvas id="c" width="800" height="500" style="max-width:95vw;max-height:90vh;background:#0f172a;border:2px solid #1f2a44;border-radius:16px"></canvas>
      <script>
        const c=document.getElementById('c'),x=c.getContext('2d');
        let p1=200,p2=200,by=250,bx=400,bvx=4,bvy=3,s1=0,s2=0;
        const keys={};
        onkeydown=e=>keys[e.key]=true;onkeyup=e=>keys[e.key]=false;
        function reset(dir){bx=400;by=250;bvx=dir*4;bvy=(Math.random()*4)-2;}
        function draw(){
          x.fillStyle='#0b1020';x.fillRect(0,0,800,500);
          x.fillStyle='#1f2a44';for(let i=0;i<10;i++){x.fillRect(398, i*50+10,4,30);}
          x.fillStyle='#7c3aed';x.fillRect(30,p1,12,80);x.fillRect(758,p2,12,80);
          x.fillStyle='#e2e8f0';x.beginPath();x.arc(bx,by,7,0,Math.PI*2);x.fill();
          x.fillStyle='#94a3b8';x.font='20px monospace';x.fillText(s1+' : '+s2,365,30);
        }
        function update(){
          if(keys['w']) p1-=6; if(keys['s']) p1+=6; if(keys['ArrowUp']) p2-=6; if(keys['ArrowDown']) p2+=6;
          p1=Math.max(10,Math.min(410,p1)); p2=Math.max(10,Math.min(410,p2));
          bx+=bvx; by+=bvy;
          if(by<10||by>490) bvy*=-1;
          if(bx<48 && by>p1 && by<p1+80){bvx*=-1;bx=48;}
          if(bx>752 && by>p2 && by<p2+80){bvx*=-1;bx=752;}
          if(bx<0){s2++;reset(1);}
          if(bx>800){s1++;reset(-1);}
          if(s1===7||s2===7){alert((s1>s2?'Player 1':'Player 2')+' wins!');s1=0;s2=0;reset(s1>s2?1:-1);}
          window.parent.postMessage({type:'SCORE_UPDATE',score:Math.max(s1,s2)},'*');
          draw();requestAnimationFrame(update);
        }
        reset(1);update();
      </script></body></html>`
  },
  {
    id: '3',
    title: 'Astro Thrust Duel',
    description: 'Two-player arena duel. Player 1: WASD + F. Player 2: Arrows + /.',
    author: 'ArcadeAdmin',
    thumbnail: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=400',
    category: 'Two Player',
    mode: 'two-player',
    createdAt: Date.now(),
    htmlContent: `
      <!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#0b0f1a;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh">
      <canvas id="c" width="820" height="520" style="max-width:95vw;max-height:90vh;background:#0b1020;border:2px solid #1f2a44;border-radius:16px"></canvas>
      <script>
        const c=document.getElementById('c'),x=c.getContext('2d');
        const keys={};onkeydown=e=>keys[e.key]=true;onkeyup=e=>keys[e.key]=false;
        const p1={x:200,y:260,vx:0,vy:0,hp:5};const p2={x:620,y:260,vx:0,vy:0,hp:5};
        let shots=[];
        function shoot(p,dir){shots.push({x:p.x,y:p.y,vx:dir*7,vy:0,life:120});}
        function step(){
          if(keys['w']) p1.vy-=0.4; if(keys['s']) p1.vy+=0.4; if(keys['a']) p1.vx-=0.4; if(keys['d']) p1.vx+=0.4;
          if(keys['ArrowUp']) p2.vy-=0.4; if(keys['ArrowDown']) p2.vy+=0.4; if(keys['ArrowLeft']) p2.vx-=0.4; if(keys['ArrowRight']) p2.vx+=0.4;
          if(keys['f']){keys['f']=false;shoot(p1,1);} if(keys['/']){keys['/']=false;shoot(p2,-1);}
          [p1,p2].forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vx*=0.95;p.vy*=0.95;p.x=Math.max(20,Math.min(800,p.x));p.y=Math.max(20,Math.min(500,p.y));});
          shots=shots.filter(s=>s.life-->0);
          shots.forEach(s=>{s.x+=s.vx;s.y+=s.vy;
            if(Math.hypot(s.x-p1.x,s.y-p1.y)<14){p1.hp--;s.life=0;}
            if(Math.hypot(s.x-p2.x,s.y-p2.y)<14){p2.hp--;s.life=0;}
          });
          if(p1.hp<=0||p2.hp<=0){alert((p1.hp>p2.hp?'Player 1':'Player 2')+' wins!');p1.hp=5;p2.hp=5;shots=[];}
        }
        function draw(){
          x.fillStyle='#0b1020';x.fillRect(0,0,820,520);
          x.strokeStyle='#1f2a44';x.strokeRect(10,10,800,500);
          x.fillStyle='#7c3aed';x.beginPath();x.arc(p1.x,p1.y,12,0,Math.PI*2);x.fill();
          x.fillStyle='#22d3ee';x.beginPath();x.arc(p2.x,p2.y,12,0,Math.PI*2);x.fill();
          x.fillStyle='#f8fafc';shots.forEach(s=>{x.fillRect(s.x-2,s.y-2,4,4);});
          x.fillStyle='#94a3b8';x.font='16px monospace';x.fillText('P1 HP: '+p1.hp,20,24);x.fillText('P2 HP: '+p2.hp,700,24);
          window.parent.postMessage({type:'SCORE_UPDATE',score:Math.max(p1.hp,p2.hp)},'*');
        }
        function loop(){step();draw();requestAnimationFrame(loop);}loop();
      </script></body></html>`
  },
  {
    id: '4',
    title: 'Sumo Squares',
    description: 'Two-player push battle. Player 1: WASD. Player 2: Arrows. Knock the other out.',
    author: 'ArcadeAdmin',
    thumbnail: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&q=80&w=400',
    category: 'Two Player',
    mode: 'two-player',
    createdAt: Date.now(),
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <style>
          :root{--red:#ff1f1f;--bg1:#280406;--bg2:#170103;--panel:rgba(22,6,8,.84);--line:rgba(255,80,80,.28);--text:#fff4f4}
          html,body{margin:0;height:100%;overflow:hidden;background:radial-gradient(circle at 50% 20%,#4d080c 0%,var(--bg1) 50%,var(--bg2) 100%);font-family:Segoe UI,Roboto,Arial,sans-serif;color:var(--text)}
          .stage{position:fixed;inset:0}
          canvas{position:absolute;left:50%;top:52%;transform:translate(-50%,-50%);width:min(90vw,1160px);height:min(64vh,700px);border:2px solid #2c1012;border-radius:34px;background:linear-gradient(180deg,#140406,#0d0204);box-shadow:inset 0 0 60px rgba(0,0,0,.5),0 28px 50px rgba(0,0,0,.45)}
          .top{position:absolute;top:22px;left:28px;right:28px;display:flex;justify-content:space-between;align-items:flex-start;pointer-events:none}
          .card{pointer-events:auto;display:flex;gap:14px;align-items:center;background:var(--panel);border:2px solid var(--line);border-radius:30px;padding:12px 16px;min-width:220px}
          .avatar{width:58px;height:58px;border-radius:14px;display:grid;place-items:center;font-size:28px;font-weight:900}
          .a1{background:linear-gradient(180deg,#ff2828,#d40f0f)}
          .a2{background:linear-gradient(180deg,#f7f7f7,#dcdcdc);color:#240507}
          .meta b{display:block;font-size:28px;line-height:1}
          .meta span{font-size:23px;letter-spacing:.11em;font-weight:900}
          .timerWrap{display:flex;flex-direction:column;align-items:center;gap:8px}
          .timer{background:var(--panel);border:3px solid var(--red);border-radius:999px;padding:10px 40px;text-align:center;min-width:190px}
          .timer small{display:block;font-size:20px;font-weight:900;letter-spacing:.14em}
          .timer b{font-size:64px;line-height:.9}
          .round{background:#b80f14;color:white;font-weight:900;padding:7px 19px;border-radius:999px;font-size:22px;letter-spacing:.07em}
          .side{position:absolute;right:26px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:18px}
          .dot{width:64px;height:64px;border-radius:50%;border:2px solid #422025;background:rgba(24,6,8,.85);display:grid;place-items:center;font-weight:900;font-size:34px}
          .bottom{position:absolute;left:28px;right:28px;bottom:20px;display:flex;justify-content:space-between;align-items:flex-end;gap:16px}
          .barWrap{width:min(30vw,390px)}
          .barHead{display:flex;justify-content:space-between;font-size:21px;font-weight:900;letter-spacing:.06em;margin-bottom:6px}
          .bar{height:20px;border-radius:999px;border:2px solid #53363a;background:rgba(255,255,255,.08);overflow:hidden}
          .bar > i{display:block;height:100%;background:linear-gradient(90deg,#ff1212,#c00909);width:0%}
          .keys{display:flex;gap:8px;align-items:center;background:rgba(15,5,7,.88);border:2px solid #3d1a1f;border-radius:999px;padding:10px 16px;font-weight:900}
          .chip{border:1px solid #61484b;border-radius:8px;padding:4px 8px;font-size:15px;background:#241013}
          .chip.red{background:#55090d;border-color:#b91b1b;color:#ff3f3f}
          .overlay{position:absolute;inset:0;background:rgba(18,3,5,.72);backdrop-filter:blur(2px);display:grid;place-items:center;z-index:8}
          .menu{width:min(92vw,900px);text-align:center}
          .titleA{font-weight:1000;font-size:min(14vw,130px);font-style:italic;line-height:.88;text-shadow:3px 4px 0 #43090b}
          .titleA .white{color:white;-webkit-text-stroke:3px #ff1212}
          .titleA .red{color:#ff1111}
          .bot{margin-top:26px;display:flex;justify-content:center;gap:14px;flex-wrap:wrap}
          .btn{cursor:pointer;border:0;border-radius:24px;padding:18px 36px;font-size:32px;font-weight:900;letter-spacing:.02em;min-width:280px;box-shadow:0 10px 0 rgba(0,0,0,.34)}
          .btn.red{background:#ff1212;color:#fff}
          .btn.white{background:#f2f2f2;color:#1f0b0c}
          .caption{margin-top:18px;font-size:18px;color:#ff9f9f;letter-spacing:.08em}
          @media (max-width:900px){
            .meta span{font-size:16px}.meta b{font-size:24px}.card{min-width:170px;padding:10px 12px}.avatar{width:44px;height:44px;font-size:20px}
            .timer b{font-size:42px}.timer small{font-size:14px}.round{font-size:15px}
            .dot{width:52px;height:52px;font-size:28px}.barHead{font-size:14px}
            .btn{font-size:24px;min-width:220px;padding:14px 24px}
          }
        </style>
      </head>
      <body>
        <div class="stage">
          <canvas id="c" width="1280" height="760"></canvas>

          <div class="top">
            <div class="card">
              <div class="avatar a1">1</div>
              <div class="meta"><span>PLAYER 1</span><b id="p1Score">00</b></div>
            </div>
            <div class="timerWrap">
              <div class="timer"><small>ROUND TIME</small><b id="time">01:45</b></div>
              <div class="round" id="round">ROUND 1</div>
            </div>
            <div class="card" style="justify-content:flex-end">
              <div class="meta" style="text-align:right"><span>PLAYER 2</span><b id="p2Score">00</b></div>
              <div class="avatar a2">2</div>
            </div>
          </div>

          <div class="side">
            <div class="dot" title="Pause">II</div>
            <div class="dot" title="Settings">*</div>
          </div>

          <div class="bottom">
            <div class="barWrap">
              <div class="barHead"><span>POWER BOOST</span><span id="p1BoostTxt">READY</span></div>
              <div class="bar"><i id="p1Boost"></i></div>
            </div>
            <div class="keys">
              <span class="chip">WASD</span> MOVE
              <span class="chip red">SPACE</span> BASH
              <span class="chip">ARROWS</span> MOVE
              <span class="chip red">SHIFT</span> BASH
            </div>
            <div class="barWrap">
              <div class="barHead"><span id="p2BoostTxt">CHARGING...</span><span>POWER BOOST</span></div>
              <div class="bar"><i id="p2Boost"></i></div>
            </div>
          </div>

          <div class="overlay" id="overlay">
            <div class="menu">
              <div class="titleA"><div class="white">SUMO</div><div class="red">SQUARE</div></div>
              <div class="bot">
                <button class="btn red" id="practiceBtn">PRACTICE</button>
                <button class="btn white" id="multiBtn">MULTIPLAYER</button>
              </div>
              <div class="caption">PLAYER 1: WASD + SPACE | PLAYER 2: ARROWS + SHIFT</div>
            </div>
          </div>
        </div>
        <script>
          const c = document.getElementById('c');
          const x = c.getContext('2d');
          const p1ScoreEl = document.getElementById('p1Score');
          const p2ScoreEl = document.getElementById('p2Score');
          const timeEl = document.getElementById('time');
          const roundEl = document.getElementById('round');
          const p1BoostEl = document.getElementById('p1Boost');
          const p2BoostEl = document.getElementById('p2Boost');
          const p1BoostTxt = document.getElementById('p1BoostTxt');
          const p2BoostTxt = document.getElementById('p2BoostTxt');
          const overlay = document.getElementById('overlay');
          const practiceBtn = document.getElementById('practiceBtn');
          const multiBtn = document.getElementById('multiBtn');

          const keys = Object.create(null);
          const arena = { cx: 640, cy: 392, r: 255 };
          const ringOut = 245;
          const roundDuration = 105;
          let timer = roundDuration;
          let p1Wins = 0;
          let p2Wins = 0;
          let round = 1;
          let mode = 'menu';
          let pauseUntil = 0;
          let message = '';
          let practice = false;

          const p1 = { x: 530, y: 392, vx: 0, vy: 0, r: 34, boost: 100, color: '#ff1a1a' };
          const p2 = { x: 750, y: 392, vx: 0, vy: 0, r: 34, boost: 0, color: '#f0f0f0' };

          function pad2(v){ return String(v).padStart(2, '0'); }
          function setTime(t){
            const s = Math.max(0, Math.ceil(t));
            const mm = Math.floor(s / 60);
            const ss = s % 60;
            timeEl.textContent = pad2(mm) + ':' + pad2(ss);
          }
          function updateHud(){
            p1ScoreEl.textContent = pad2(p1Wins);
            p2ScoreEl.textContent = pad2(p2Wins);
            roundEl.textContent = 'ROUND ' + round;
            p1BoostEl.style.width = Math.max(0, Math.min(100, p1.boost)) + '%';
            p2BoostEl.style.width = Math.max(0, Math.min(100, p2.boost)) + '%';
            p1BoostTxt.textContent = p1.boost >= 100 ? 'READY' : 'CHARGING...';
            p2BoostTxt.textContent = p2.boost >= 100 ? 'READY' : 'CHARGING...';
          }

          function resetRound(){
            p1.x = 530; p1.y = 392; p1.vx = 0; p1.vy = 0; p1.boost = Math.min(100, p1.boost + 18);
            p2.x = 750; p2.y = 392; p2.vx = 0; p2.vy = 0; p2.boost = Math.min(100, p2.boost + 18);
            timer = roundDuration;
            mode = 'play';
            updateHud();
          }

          function startGame(isPractice){
            practice = isPractice;
            overlay.style.display = 'none';
            mode = 'play';
            p1Wins = 0; p2Wins = 0; round = 1;
            p1.boost = 100; p2.boost = 100;
            resetRound();
          }

          practiceBtn.addEventListener('click', () => startGame(true));
          multiBtn.addEventListener('click', () => startGame(false));

          addEventListener('keydown', (e) => {
            keys[e.key] = true;
            if ((e.key === 'Enter' || e.key === ' ') && mode !== 'play') {
              startGame(false);
            }
          });
          addEventListener('keyup', (e) => { keys[e.key] = false; });

          function useBash(player, nx, ny){
            if (player.boost < 100) return;
            player.boost = 0;
            player.vx += nx * 9;
            player.vy += ny * 9;
          }

          function inputStep(dt){
            const step = dt * 60;
            const acc = 0.32 * step;
            if (keys['w'] || keys['W']) p1.vy -= acc;
            if (keys['s'] || keys['S']) p1.vy += acc;
            if (keys['a'] || keys['A']) p1.vx -= acc;
            if (keys['d'] || keys['D']) p1.vx += acc;
            if (keys['ArrowUp']) p2.vy -= acc;
            if (keys['ArrowDown']) p2.vy += acc;
            if (keys['ArrowLeft']) p2.vx -= acc;
            if (keys['ArrowRight']) p2.vx += acc;

            if (keys[' '] || keys['Spacebar']) {
              keys[' '] = false; keys['Spacebar'] = false;
              const m = Math.hypot(p1.vx, p1.vy) || 1;
              useBash(p1, p1.vx / m, p1.vy / m);
            }
            if (keys['Shift'] || keys['ShiftRight'] || keys['ShiftLeft']) {
              keys['Shift'] = false; keys['ShiftRight'] = false; keys['ShiftLeft'] = false;
              const m = Math.hypot(p2.vx, p2.vy) || 1;
              useBash(p2, p2.vx / m, p2.vy / m);
            }

            const maxV = 7.8;
            p1.vx = Math.max(-maxV, Math.min(maxV, p1.vx));
            p1.vy = Math.max(-maxV, Math.min(maxV, p1.vy));
            p2.vx = Math.max(-maxV, Math.min(maxV, p2.vx));
            p2.vy = Math.max(-maxV, Math.min(maxV, p2.vy));
          }

          function simStep(dt){
            const step = dt * 60;
            p1.x += p1.vx * step; p1.y += p1.vy * step;
            p2.x += p2.vx * step; p2.y += p2.vy * step;
            const drag = Math.pow(0.91, step);
            p1.vx *= drag; p1.vy *= drag;
            p2.vx *= drag; p2.vy *= drag;
            p1.boost = Math.min(100, p1.boost + 22 * dt);
            p2.boost = Math.min(100, p2.boost + 22 * dt);

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const d = Math.hypot(dx, dy) || 1;
            const minD = p1.r + p2.r;
            if (d < minD) {
              const nx = dx / d;
              const ny = dy / d;
              const push = (minD - d) * 0.55;
              p1.x -= nx * push; p1.y -= ny * push;
              p2.x += nx * push; p2.y += ny * push;
              p1.vx -= nx * 0.7; p1.vy -= ny * 0.7;
              p2.vx += nx * 0.7; p2.vy += ny * 0.7;
            }
          }

          function out(p){
            const dx = p.x - arena.cx;
            const dy = p.y - arena.cy;
            return Math.hypot(dx, dy) > ringOut;
          }

          function finishRound(win){
            mode = 'pause';
            if (win === 1) p1Wins += 1; else p2Wins += 1;
            message = win === 1 ? 'PLAYER 1 SCORES' : 'PLAYER 2 SCORES';
            pauseUntil = performance.now() + 1200;
            window.parent.postMessage({ type: 'SCORE_UPDATE', score: Math.max(p1Wins, p2Wins) }, '*');

            if (p1Wins >= 3 || p2Wins >= 3) {
              mode = 'gameover';
              overlay.style.display = 'grid';
              message = p1Wins > p2Wins ? 'PLAYER 1 WINS MATCH' : 'PLAYER 2 WINS MATCH';
              roundEl.textContent = message;
              return;
            }

            round += 1;
            updateHud();
          }

          function drawArena(){
            x.clearRect(0, 0, c.width, c.height);
            x.fillStyle = '#140406';
            x.fillRect(0, 0, c.width, c.height);

            x.strokeStyle = 'rgba(255,30,30,0.32)';
            x.lineWidth = 14;
            x.beginPath();
            x.arc(arena.cx - 140, arena.cy, 200, 0, Math.PI * 2);
            x.stroke();
            x.beginPath();
            x.arc(arena.cx + 140, arena.cy, 200, 0, Math.PI * 2);
            x.stroke();

            x.strokeStyle = 'rgba(255,60,60,0.55)';
            x.lineWidth = 8;
            x.beginPath();
            x.arc(arena.cx, arena.cy, ringOut, 0, Math.PI * 2);
            x.stroke();

            x.fillStyle = 'rgba(255,255,255,0.13)';
            x.fillRect(arena.cx - 2, arena.cy - 30, 4, 60);
            x.fillRect(arena.cx - 30, arena.cy - 2, 60, 4);
          }

          function drawFighter(p, faceDark){
            x.save();
            x.translate(p.x - 34, p.y - 34);
            x.fillStyle = p.color;
            x.strokeStyle = 'rgba(255,255,255,0.25)';
            x.lineWidth = 4;
            x.beginPath();
            x.roundRect(0, 0, 68, 68, 18);
            x.fill();
            x.stroke();
            x.fillStyle = faceDark ? '#13090a' : '#f7f7f7';
            x.fillRect(12, 48, 44, 6);
            x.fillStyle = faceDark ? '#f4f4f4' : '#060606';
            x.beginPath(); x.arc(20, 24, 6, 0, Math.PI * 2); x.fill();
            x.beginPath(); x.arc(48, 24, 6, 0, Math.PI * 2); x.fill();
            x.fillRect(22, 40, 24, 4);
            x.restore();
          }

          function drawMessage(t){
            if (!t) return;
            x.fillStyle = 'rgba(22,4,6,0.8)';
            x.fillRect(c.width / 2 - 240, 30, 480, 60);
            x.strokeStyle = 'rgba(255,50,50,0.45)';
            x.strokeRect(c.width / 2 - 240, 30, 480, 60);
            x.fillStyle = '#fff3f3';
            x.textAlign = 'center';
            x.font = '900 30px Segoe UI';
            x.fillText(t, c.width / 2, 69);
          }

          let last = performance.now();
          let hudTick = 0;
          let timerTick = 0;
          function loop(now){
            const dt = Math.min(0.033, (now - last) / 1000);
            last = now;

            if (mode === 'play') {
              inputStep(dt);
              simStep(dt);
              timer -= dt;
              timerTick += dt;
              hudTick += dt;
              if (timerTick >= 0.05) {
                setTime(timer);
                timerTick = 0;
              }
              if (hudTick >= 0.05) {
                updateHud();
                hudTick = 0;
              }

              if (out(p1)) finishRound(2);
              else if (out(p2)) finishRound(1);
              else if (timer <= 0) {
                const d1 = Math.hypot(p1.x - arena.cx, p1.y - arena.cy);
                const d2 = Math.hypot(p2.x - arena.cx, p2.y - arena.cy);
                finishRound(d1 < d2 ? 1 : 2);
              }
            } else if (mode === 'pause' && now > pauseUntil) {
              resetRound();
            }

            drawArena();
            drawFighter(p1, true);
            drawFighter(p2, false);
            if (mode === 'pause') drawMessage(message);
            if (mode === 'gameover') drawMessage(message);

            requestAnimationFrame(loop);
          }

          updateHud();
          setTime(timer);
          requestAnimationFrame(loop);
        </script>
      </body>
      </html>`
  }
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'games' | 'events' | 'leaderboard' | 'ai-studio'>('games');
  const [games, setGames] = useState<Game[]>([]);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [roomPlayers, setRoomPlayers] = useState<string[]>([]);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('ah_token');
    if (savedToken) setToken(savedToken);

    const savedGames = localStorage.getItem('ah_games');
    const savedEvents = localStorage.getItem('ah_events');
    const savedLeaderboard = localStorage.getItem('ah_leaderboard');

    setGames(savedGames ? JSON.parse(savedGames) : INITIAL_GAMES);
    setEvents(savedEvents ? JSON.parse(savedEvents) : [{
      id: 'e1',
      gameId: '1',
      title: 'Cyber Sprint 2024',
      description: 'Compete for the highest score in Neon Runner and win 500 Credits!',
      startTime: Date.now() - 3600000,
      endTime: Date.now() + 86400000,
      prizePool: '500 ARC',
      status: 'active'
    }]);
    setLeaderboard(savedLeaderboard ? JSON.parse(savedLeaderboard) : []);
  }, []);

  useEffect(() => {
    if (!token) {
      setAuthChecked(true);
      return;
    }
    getMe(token)
      .then((me) => {
        const newUser = {
          id: me.id,
          username: me.username,
          avatar: `https://picsum.photos/seed/${me.username}/100/100`
        };
        setUser(newUser);
        localStorage.setItem('ah_user', JSON.stringify(newUser));
      })
      .catch(() => {
        localStorage.removeItem('ah_token');
        localStorage.removeItem('ah_user');
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setAuthChecked(true);
      });
  }, [token]);

  const handleAuthSuccess = (newToken: string, newUser: User) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('ah_user', JSON.stringify(newUser));
    localStorage.setItem('ah_token', newToken);
    setShowSignIn(false);
  };

  const handleSignOut = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ah_user');
    localStorage.removeItem('ah_token');
    setSelectedGame(null);
    setRoomCode(null);
    setRoomPlayers([]);
    leaveRoomSocket();
  };

  const handlePlayGame = async (game: Game) => {
    setJoinError(null);
    if (game.mode === 'two-player') {
      if (!token || !user) {
        setJoinError('Please sign in to create a room.');
        return;
      }
      try {
        const res = await createRoomForGame(token, game);
        const newGame: Game = {
          id: res.game.id,
          title: res.game.title,
          description: res.game.description,
          category: res.game.category || game.category,
          htmlContent: res.game.htmlContent,
          author: res.game.author || game.author,
          thumbnail: game.thumbnail,
          createdAt: res.game.createdAt || Date.now(),
          mode: res.game.mode || game.mode
        };
        setSelectedGame(newGame);
        setRoomCode(res.roomCode);
        setRoomPlayers(res.players || []);
        joinRoomSocket(res.roomCode, user.username, setRoomPlayers, (msg) => setJoinError(msg));
        return;
      } catch (err) {
        setJoinError(err instanceof Error ? err.message : 'Room creation failed.');
        return;
      }
    }
    setSelectedGame(game);
  };

  const submitScore = useCallback((gameId: string, score: number) => {
    if (!user) return;
    const newEntry: LeaderboardEntry = {
      id: Math.random().toString(36).substr(2, 9),
      gameId,
      username: user.username,
      score,
      timestamp: Date.now()
    };
    const updated = [newEntry, ...leaderboard].sort((a, b) => b.score - a.score).slice(0, 100);
    setLeaderboard(updated);
    localStorage.setItem('ah_leaderboard', JSON.stringify(updated));
  }, [user, leaderboard]);

  if (!authChecked || (!user && !showSignIn)) {
    return <LandingPage onGetStarted={() => setShowSignIn(true)} />;
  }

  if (showSignIn) {
    return <SignIn onAuthSuccess={handleAuthSuccess} onBack={() => setShowSignIn(false)} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedGame(null);
        }} 
      />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-bold text-indigo-400 retro-font tracking-tight">
            {activeTab.toUpperCase()}
          </h2>
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ROOM CODE"
                  className="bg-transparent text-xs font-bold tracking-widest text-slate-300 outline-none w-28 placeholder:text-slate-600"
                />
                <button
                  onClick={async () => {
                    if (!token || !user || !joinCode) return;
                    setJoinError(null);
                    try {
                      const res = await joinRoomApi(token, joinCode.trim());
                      setSelectedGame(res.game);
                      setRoomCode(res.roomCode);
                      setRoomPlayers(res.players || []);
                      joinRoomSocket(res.roomCode, user.username, setRoomPlayers, (msg) => setJoinError(msg));
                    } catch (err) {
                      setJoinError(err instanceof Error ? err.message : 'Join failed.');
                    }
                  }}
                  className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-black"
                >
                  Join
                </button>
              </div>
              <button 
                onClick={() => setIsUploadOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/20"
              >
                Upload Game
              </button>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-400">{user?.username}</span>
              <button 
                onClick={handleSignOut}
                className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden hover:opacity-80 transition-opacity"
              >
                <img src={user?.avatar} alt="avatar" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {joinError && (
            <div className="mb-4 text-sm text-red-400 font-bold">{joinError}</div>
          )}
          {roomCode && (
            <div className="mb-6 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-wrap items-center gap-4">
              <div className="text-xs font-black tracking-widest text-indigo-400">ROOM {roomCode}</div>
              <div className="text-xs text-slate-400">Players: {roomPlayers.length ? roomPlayers.join(', ') : 'Loading...'}</div>
            </div>
          )}
          {selectedGame ? (
            <GamePlayer 
              game={selectedGame} 
              isTwoPlayer={selectedGame.mode === 'two-player'}
              roomCode={roomCode}
              roomPlayers={roomPlayers}
              currentUsername={user?.username || null}
              onClose={() => setSelectedGame(null)} 
              onScoreSubmit={(score) => submitScore(selectedGame.id, score)}
            />
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === 'games' && <Dashboard games={games} onPlay={handlePlayGame} />}
              {activeTab === 'events' && <EventsList events={events} games={games} onPlayGame={(id) => {
                const g = games.find(g => g.id === id) || null;
                if (g) handlePlayGame(g);
              }} />}
              {activeTab === 'leaderboard' && <LeaderboardView leaderboard={leaderboard} games={games} />}
              {activeTab === 'ai-studio' && (
                <AIStudio
                  token={token}
                  onGameGenerated={(g, room) => {
                    setGames([g, ...games]);
                    setActiveTab('games');
                    if (room && user) {
                      setRoomCode(room);
                      setRoomPlayers([user.username]);
                      joinRoomSocket(room, user.username, setRoomPlayers);
                    }
                  }}
                />
              )}
            </div>
          )}
        </div>
      </main>

      {isUploadOpen && (
        <UploadModal 
          onClose={() => setIsUploadOpen(false)} 
          onUpload={(g) => { setGames([g, ...games]); setIsUploadOpen(false); }} 
        />
      )}
    </div>
  );
};

export default App;

