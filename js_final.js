
var MP={1:'Jan',2:'Fev',3:'Mar',4:'Abr',5:'Mai',6:'Jun',7:'Jul',8:'Ago',9:'Set',10:'Out',11:'Nov',12:'Dez'};
var MC=['#CAFF00','#4a9eff','#ff8c42','#a8e6cf','#f5e07e','#e07ef5','#7ef5e0','#f5c07e','#ff6b9d','#c3a6ff'];
var SIT_ORD=['Embarcado','Aguardando prontid\u00e3o da mercadoria','Aguardando embarque','Pendente','Finalizado','Desembarcado','Cancelado'];
var TL=['Aguardando prontid\u00e3o da mercadoria','Aguardando embarque','Embarcado','Desembarcado','Finalizado'];
var SC={};
SC['Finalizado']    ={d:'#CAFF00',b:'#0e2000',t:'#CAFF00'};
SC['Embarcado']     ={d:'#4a9eff',b:'#001830',t:'#4a9eff'};
SC['Desembarcado']  ={d:'#00e5cc',b:'#001814',t:'#00e5cc'};
SC['Cancelado']     ={d:'#ff5555',b:'#1e0000',t:'#ff5555'};
SC['Aguardando prontid\u00e3o da mercadoria']={d:'#ffb347',b:'#1c1000',t:'#ffb347'};
SC['Aguardando embarque']={d:'#ffb347',b:'#1c1000',t:'#ffb347'};
SC['Pendente']      ={d:'#666',b:'#181818',t:'#777'};
var SS={};
SS['Finalizado']='Finalizado';
SS['Embarcado']='Embarcado';
SS['Desembarcado']='Desembarcado';
SS['Cancelado']='Cancelado';
SS['Aguardando prontid\u00e3o da mercadoria']='Aguard.Prontidao';
SS['Aguardando embarque']='Aguard.Embarque';
SS['Pendente']='Pendente';

var RAW;
try{
  RAW=JSON.parse(document.getElementById('D').value);
}catch(e){
  document.body.innerHTML='<div style="color:red;padding:40px;font-family:Arial;font-size:14px;">Erro: '+e.message+'</div>';
}

function fmt(n){return n?Math.round(n).toLocaleString('pt-BR'):'0';}
function pct(a,b){return a>0?Math.round((b-a)/a*100):null;}
function cv(v){
  if(v===null)return '<span class="chip cz">-</span>';
  return '<span class="chip '+(v>=0?'cp':'cn')+'">'+(v>=0?'+':'')+v+'%</span>';
}
function sc(s){return SC[s]||{d:'#333',b:'#111',t:'#555'};}
function ss(s){return SS[s]||s||'-';}
function grp(data,k){
  var m={};
  data.forEach(function(r){var v=r[k]||'';if(!v)return;m[v]=(m[v]||0)+r.teus;});
  return Object.entries(m).sort(function(a,b){return b[1]-a[1];});
}
function grp2(data,k){
  var m={};
  data.forEach(function(r){
    var v=r[k]||'';if(!v)return;
    if(!m[v])m[v]={v25:0,v26:0};
    if(r.ano===2025)m[v].v25+=r.teus;
    else if(r.ano===2026)m[v].v26+=r.teus;
  });
  return Object.entries(m).map(function(e){
    return{nm:e[0],v25:e[1].v25,v26:e[1].v26,tot:e[1].v25+e[1].v26};
  }).sort(function(a,b){return b.tot-a.tot;});
}
function okFCL(r){return r.fcl==='FCL'&&r.situacao!=='Cancelado';}
function fcl(data){return data.filter(okFCL);}

function popularSelects(){
  var mS={},aS={},oS={},dS={},sS={},mrcS={};
  RAW.forEach(function(r){
    if(r.mes&&r.ano){var k=r.ano+'-'+('0'+r.mes).slice(-2);mS[k]=1;}
    if(r.armador)aS[r.armador]=1;
    if(r.origem)oS[r.origem]=1;
    if(r.destino)dS[r.destino]=1;
    if(r.situacao)sS[r.situacao]=1;
    if(r.mercadoria)mrcS[r.mercadoria]=1;
  });
  function add(id,v,t){
    var o=document.createElement('option');o.value=v;o.textContent=t;
    document.getElementById(id).appendChild(o);
  }
  Object.keys(mS).sort().forEach(function(k){
    var p=k.split('-');add('fmes',p[1],MP[+p[1]]+'/'+p[0]);
  });
  Object.keys(aS).sort().forEach(function(a){
    add('farm',a,a);add('pfarm',a,a);add('varm',a,a);
  });
  Object.keys(oS).sort().forEach(function(a){add('fori',a,a);});
  Object.keys(dS).sort().forEach(function(a){add('fdest',a,a);add('vdest',a,a);});
  Object.keys(sS).sort().forEach(function(a){add('fsit',a,ss(a));add('pfsit',a,ss(a));});
  Object.keys(mrcS).sort().slice(0,80).forEach(function(a){add('fmerc',a,a);});
  var ks=Object.keys(mS).sort();
  ks.forEach(function(k){
    var p=k.split('-');add('vm1',k,MP[+p[1]]+'/'+p[0]);add('vm2',k,MP[+p[1]]+'/'+p[0]);
  });
  if(ks.length>=2){
    document.getElementById('vm1').value=ks[ks.length-2];
    document.getElementById('vm2').value=ks[ks.length-1];
  }
}

function gF(){
  return{
    ano:document.getElementById('fano').value,
    mes:document.getElementById('fmes').value,
    arm:document.getElementById('farm').value,
    ori:document.getElementById('fori').value,
    dest:document.getElementById('fdest').value,
    sit:document.getElementById('fsit').value,
    merc:document.getElementById('fmerc').value
  };
}
function fil(data,f){
  return data.filter(function(r){
    if(f.ano&&String(r.ano)!==f.ano)return false;
    if(f.mes&&Number(r.mes)!==Number(f.mes))return false;
    if(f.arm&&r.armador!==f.arm)return false;
    if(f.ori&&r.origem!==f.ori)return false;
    if(f.dest&&r.destino!==f.dest)return false;
    if(f.sit&&r.situacao!==f.sit)return false;
    if(f.merc&&r.mercadoria!==f.merc)return false;
    return true;
  });
}
function resetF(){
  ['fano','fmes','farm','fori','fdest','fsit','fmerc'].forEach(function(id){
    document.getElementById(id).value='';
  });
  render();
}

function render(){
  var f=gF();
  var data=fil(RAW,f);
  var nomes={ano:'Ano',mes:'Mes',arm:'Armador',ori:'Origem',dest:'Destino',sit:'Situacao',merc:'Mercadoria'};
  var at=Object.entries(f).filter(function(e){return e[1];});
  var fel=document.getElementById('fativo');
  if(at.length){
    fel.style.display='block';
    fel.textContent='Filtros: '+at.map(function(e){
      return nomes[e[0]]+': '+(e[0]==='mes'?(MP[Number(e[1])]||e[1]):e[1]);
    }).join(' | ');
  }else{fel.style.display='none';}
  rKPIs(data,f);rSits(data);rMensal(data,f);
  rTopArm(data);rTblArm(data,f);rRotas(data);rMerc(data);
  rSmp(data,'exportador','tbl-exp',8);
  rSmp(data,'cliente','tbl-cli',8);
  document.getElementById('arm-per').textContent=f.ano||'2025 vs 2026';
}

function kpi(cl,lbl,val,sup,sub,sc2){
  return '<div class="kpi '+cl+'"><div class="klbl">'+lbl+'</div>'
    +'<div class="kval">'+val+(sup?'<sup>'+sup+'</sup>':'')+'</div>'
    +'<div class="ksub '+sc2+'">'+sub+'</div></div>';
}
function rKPIs(data,f){
  var d=fcl(data);var t25=0,t26=0;
  d.forEach(function(r){if(r.ano===2025)t25+=r.teus;else if(r.ano===2026)t26+=r.teus;});
  var tot=t25+t26;var vp=pct(t25,t26);
  var nA=Object.keys(d.reduce(function(m,r){if(r.armador)m[r.armador]=1;return m;},{})).length;
  var nD=Object.keys(d.reduce(function(m,r){if(r.destino)m[r.destino]=1;return m;},{})).length;
  var sitAb=SIT_ORD.slice(0,3);
  var ab=data.filter(function(r){return sitAb.indexOf(r.situacao)>=0;}).length;
  var h='';
  if(!f.ano){
    h+=kpi('kb','Total 2025',fmt(t25),'TEUs','periodo base','neu');
    h+=kpi('kg','Total 2026',fmt(t26),'TEUs',
      t26>=t25?'+'+fmt(t26-t25)+' TEUs':'-'+fmt(t25-t26)+' TEUs',
      t26>=t25?'pos':'neg');
    h+=kpi(vp>=0?'kg':'kr','Crescimento',
      vp!==null?(vp>=0?'+':'')+vp+'%':'-','','var. anual',vp>=0?'pos':'neg');
  }else{
    h+=kpi('kg','Total TEUs',fmt(tot),'TEUs','ano '+f.ano,'');
  }
  h+=kpi('ka','Em aberto',ab,'proc','aguardando/embarcado','amb');
  h+=kpi('kz','Armadores',nA,'','ativos','neu');
  h+=kpi('kz','Destinos',nD,'','rotas','neu');
  document.getElementById('kpis').innerHTML=h;
}

function rSits(data){
  var m={};
  data.forEach(function(r){var k=r.situacao||'?';m[k]=(m[k]||0)+1;});
  var tot=data.length||1;
  var h='';
  SIT_ORD.forEach(function(sit,idx){
    var cnt=m[sit]||0;if(!cnt)return;
    var c=sc(sit);
    h+='<div class="scard" data-idx="'+idx+'" style="border-color:'+c.d+'28;">'
      +'<div class="sdot" style="background:'+c.d+'"></div>'
      +'<div style="flex:1;min-width:0;">'
      +'<div class="snm">'+ss(sit)+'</div>'
      +'<div class="scnt" style="color:'+c.t+'">'+cnt+'</div>'
      +'<div class="spct">'+Math.round(cnt/tot*100)+'%</div>'
      +'</div></div>';
  });
  var el=document.getElementById('sits');
  el.innerHTML=h;
  el.querySelectorAll('.scard').forEach(function(card){
    card.addEventListener('click',function(){
      filtSit(SIT_ORD[+card.getAttribute('data-idx')]);
    });
  });
}
function filtSit(s){document.getElementById('fsit').value=s;render();}

function rMensal(data,f){
  var d=fcl(data);var maxV=0;
  for(var m=1;m<=12;m++){
    var t=d.filter(function(r){return r.mes===m;}).reduce(function(s,r){return s+r.teus;},0);
    if(t>maxV)maxV=t;
  }
  if(!maxV)maxV=1;
  var h='';
  for(var m=1;m<=12;m++){
    (function(mm){
      var dm=d.filter(function(r){return r.mes===mm;});
      var v25=dm.filter(function(r){return r.ano===2025;}).reduce(function(s,r){return s+r.teus;},0);
      var v26=dm.filter(function(r){return r.ano===2026;}).reduce(function(s,r){return s+r.teus;},0);
      var w25=Math.round(v25/maxV*100),w26=Math.round(v26/maxV*100);
      if(!f.ano){
        h+='<div class="brow">'
          +'<div class="blbl">'+MP[mm]+'</div>'
          +'<div class="bwrap">'
          +'<div class="bsr"><div class="btr"><div class="bf b25" style="width:'+w25+'%"></div></div>'
          +'<div class="bnum">'+(v25?fmt(v25):'')+'</div></div>'
          +'<div class="bsr"><div class="btr"><div class="bf b26" style="width:'+w26+'%"></div></div>'
          +'<div class="bnum" style="color:'+(v26?'#CAFF00':'#222')+'">'+(v26?fmt(v26):'')+'</div></div>'
          +'</div></div>';
      }else{
        var v=f.ano==='2025'?v25:v26;
        var w=Math.round(v/maxV*100);
        h+='<div class="brow">'
          +'<div class="blbl">'+MP[mm]+'</div>'
          +'<div class="bwrap"><div class="bsr">'
          +'<div class="btr"><div class="bf b26" style="width:'+w+'%"></div></div>'
          +'<div class="bnum" style="color:'+(v?'#CAFF00':'#222')+'">'+(v?fmt(v):'')+'</div>'
          +'</div></div></div>';
      }
    })(m);
  }
  document.getElementById('chart-mes').innerHTML=h;
}

function rTopArm(data){
  var top=grp(fcl(data),'armador').slice(0,8);
  var max=top.length?top[0][1]:1;
  var h='<div style="display:flex;flex-direction:column;gap:6px;">';
  top.forEach(function(e){
    var nm=e[0],v=e[1];
    var w=Math.round(v/max*100);
    var sh=nm.length>26?nm.slice(0,24)+'...':nm;
    h+='<div style="display:flex;align-items:center;gap:7px;font-size:11px;">'
      +'<div style="flex:1;color:#ccc;min-width:0;">'+sh+'</div>'
      +'<div style="width:60px;height:5px;background:#111;border-radius:1px;overflow:hidden;flex-shrink:0;">'
      +'<div style="width:'+w+'%;height:100%;background:#CAFF00;border-radius:1px;"></div></div>'
      +'<div style="color:#999;width:34px;text-align:right;flex-shrink:0;">'+fmt(v)+'</div></div>';
  });
  h+='</div>';
  document.getElementById('chart-arm').innerHTML=h;
}

function rTblArm(data,f){
  var rows=grp2(fcl(data),'armador').filter(function(r){return r.tot>0;}).slice(0,12);
  var h='<thead><tr><th>Armador</th><th class="r">2025</th><th class="r">2026</th><th class="r">Var%</th></tr></thead><tbody>';
  rows.forEach(function(r){
    h+='<tr><td><span class="nm">'+r.nm+'</span></td>'
      +'<td class="r">'+(r.v25?fmt(r.v25):'-')+'</td>'
      +'<td class="r">'+(r.v26?fmt(r.v26):'-')+'</td>'
      +'<td class="r">'+cv(pct(r.v25,r.v26))+'</td></tr>';
  });
  document.getElementById('tbl-arm').innerHTML=h+'</tbody>';
}

function rRotas(data){
  var top=grp(fcl(data),'destino').slice(0,12);
  var max=top.length?top[0][1]:1;
  var h='';
  top.forEach(function(e,i){
    var nm=e[0],v=e[1];
    var w=Math.round(v/max*100);
    h+='<div class="ri">'
      +'<div class="rk '+(i<3?'top':'')+'">'+( i+1)+'</div>'
      +'<div class="rn">'+nm+'</div>'
      +'<div class="rbar"><div class="rbar-f" style="width:'+w+'%"></div></div>'
      +'<div class="rv">'+fmt(v)+'</div></div>';
  });
  document.getElementById('list-rot').innerHTML=h;
}

function rMerc(data){
  var top=grp(fcl(data),'mercadoria').filter(function(e){return e[0]&&e[0].trim();}).slice(0,8);
  var tot=top.reduce(function(s,e){return s+e[1];},0)||1;
  var h='';
  top.forEach(function(e,i){
    var nm=e[0],v=e[1];
    var p=Math.round(v/tot*100);
    var w=Math.round(v/top[0][1]*100);
    var cor=MC[i]||'#555';
    h+='<div class="mi">'
      +'<div class="mdot" style="background:'+cor+'"></div>'
      +'<div class="mnm">'+(nm.length>26?nm.slice(0,24)+'...':nm)+'</div>'
      +'<div class="mtr"><div class="mfl" style="width:'+w+'%;background:'+cor+'"></div></div>'
      +'<div class="mpct">'+p+'%</div></div>';
  });
  document.getElementById('list-merc').innerHTML=h;
}

function rSmp(data,campo,elId,top){
  var rows=grp2(fcl(data),campo).filter(function(r){return r.nm&&r.nm.trim();}).slice(0,top||8);
  var h='<thead><tr><th>'+campo.charAt(0).toUpperCase()+campo.slice(1)+'</th>'
    +'<th class="r">2025</th><th class="r">2026</th></tr></thead><tbody>';
  rows.forEach(function(r){
    var nm=r.nm.length>28?r.nm.slice(0,26)+'...':r.nm;
    h+='<tr><td><span class="nm" title="'+r.nm+'">'+nm+'</span></td>'
      +'<td class="r">'+(r.v25?fmt(r.v25):'-')+'</td>'
      +'<td class="r">'+(r.v26?fmt(r.v26):'-')+'</td></tr>';
  });
  document.getElementById(elId).innerHTML=h+'</tbody>';
}

function buscar(){
  var q=(document.getElementById('sinp').value||'').trim().toUpperCase();
  var res=document.getElementById('pres');
  if(!q){res.style.display='none';return;}
  var hits=RAW.filter(function(r){
    return r.proc.toUpperCase().indexOf(q)>=0||r.booking.toUpperCase().indexOf(q)>=0;
  });
  res.style.display='block';
  if(!hits.length){
    res.innerHTML='<div style="background:#0d0d0d;border:1px solid #1a1a1a;border-radius:6px;padding:24px;text-align:center;color:#222;">Nenhum processo: '+q+'</div>';
    return;
  }
  var html='';
  hits.slice(0,3).forEach(function(r){
    var c=sc(r.situacao);
    var tlIdx=TL.indexOf(r.situacao);
    var isCan=r.situacao==='Cancelado';
    var tldots='';
    TL.forEach(function(st,i){
      var done=!isCan&&(tlIdx>i||(r.situacao===st));
      var cur=!isCan&&r.situacao===st;
      var dc=isCan?'can':(cur?'cur':(done?'done':''));
      var lc=cur?'cur':(done?'done':'');
      if(i>0)tldots+='<div class="tll'+((!isCan&&tlIdx>i)?' done':'')+'"></div>';
      tldots+='<div class="tls"><div class="tld '+dc+'"></div><div class="tllbl '+lc+'">'+ss(st)+'</div></div>';
    });
    html+='<div class="pcard">'
      +'<div class="phdr">'
      +'<div><div class="pnum">'+(r.proc||'-')+'</div><div class="pbkg">Booking: '+(r.booking||'-')+'</div></div>'
      +'<div class="psbadge" style="background:'+c.b+';color:'+c.t+';">'+r.situacao+'</div></div>'
      +'<div class="pbody">'
      +'<div class="psec"><div class="pstitle">Rota</div>'
      +'<div class="pf"><div class="pfl">Origem</div><div class="pfv">'+(r.origem||'-')+'</div></div>'
      +'<div class="pf"><div class="pfl">Destino</div><div class="pfv">'+(r.destino||'-')+'</div></div>'
      +'<div class="pf"><div class="pfl">Armador</div><div class="pfv">'+(r.armador||'-')+'</div></div>'
      +'<div class="pf"><div class="pfl">Navio</div><div class="pfv">'+(r.navio||'-')+'</div></div></div>'
      +'<div class="psec"><div class="pstitle">Datas</div>'
      +'<div class="pf"><div class="pfl">Abertura</div><div class="pfv">'+(r.abertura||'-')+'</div></div>'
      +'<div class="pf"><div class="pfl">ETD</div><div class="pfv">'+(r.etd||'-')+'</div></div>'
      +'<div class="pf"><div class="pfl">ETA</div><div class="pfv">'+(r.eta||'-')+'</div></div>'
      +'<div class="pf"><div class="pfl">Mercadoria</div><div class="pfv">'+(r.mercadoria||'-')+'</div></div></div>'
      +'<div class="psec"><div class="pstitle">Carga</div>'
      +'<div class="pf"><div class="pfl">Exportador</div><div class="pfv">'+(r.exportador||'-')+'</div></div>'
      +'<div class="pf"><div class="pfl">Cliente</div><div class="pfv">'+(r.cliente||'-')+'</div></div>'
      +'<div class="pf"><div class="pfl">Containers</div><div class="pfv">'
      +(r.c20?r.c20+"x20' ":'')+(r.c40?r.c40+"x40'":'')+'</div></div>'
      +'<div class="pf"><div class="pfl">Total TEUs</div><div class="pfv big">'+r.teus+'</div></div>'
      +'</div></div>'
      +'<div class="ptl">'+tldots+'</div></div>';
  });
  if(hits.length>3){
    html+='<div style="font-size:10px;color:#333;text-align:center;padding:8px;">+'+(hits.length-3)+' processos - refine a busca</div>';
  }
  res.innerHTML=html;
}

var ppg=0,PAGE=50;
function listaProc(){ppg=0;_lp();}
function mudaPag(d){ppg+=d;_lp();}
function _lp(){
  var sit=document.getElementById('pfsit').value;
  var arm=document.getElementById('pfarm').value;
  var ano=document.getElementById('pfano').value;
  var txt=(document.getElementById('pftxt').value||'').toLowerCase();
  var data=RAW.filter(function(r){
    if(sit&&r.situacao!==sit)return false;
    if(arm&&r.armador!==arm)return false;
    if(ano&&String(r.ano)!==ano)return false;
    if(txt&&(r.proc+' '+r.cliente+' '+r.exportador+' '+r.destino+' '+r.armador).toLowerCase().indexOf(txt)<0)return false;
    return true;
  });
  data.sort(function(a,b){return a.proc<b.proc?-1:a.proc>b.proc?1:0;});
  document.getElementById('proc-cnt').textContent=data.length+' registro(s)';
  var pg=data.slice(ppg*PAGE,(ppg+1)*PAGE);
  var h='';
  pg.forEach(function(r){
    var c=sc(r.situacao);
    var clSh=r.cliente.length>18?r.cliente.slice(0,16)+'...':r.cliente;
    var armSh=r.armador.split(' ').slice(0,2).join(' ');
    h+='<tr>'
      +'<td class="td-proc" data-proc="'+r.proc+'"><span class="nm" style="color:#CAFF00;cursor:pointer;">'+r.proc+'</span></td>'
      +'<td>'+(r.abertura||'-')+'</td>'
      +'<td>'+(r.etd||'-')+'</td>'
      +'<td>'+(r.eta||'-')+'</td>'
      +'<td>'+(r.origem||'-')+'</td>'
      +'<td>'+(r.destino||'-')+'</td>'
      +'<td>'+armSh+'</td>'
      +'<td>'+clSh+'</td>'
      +'<td class="r">'+r.teus+'</td>'
      +'<td><span style="font-size:8px;font-weight:700;padding:2px 6px;border-radius:2px;background:'+c.b+';color:'+c.t+'">'+ss(r.situacao)+'</span></td>'
      +'</tr>';
  });
  var tbody=document.getElementById('tbody-proc');
  tbody.innerHTML=h;
  tbody.querySelectorAll('.td-proc').forEach(function(td){
    td.addEventListener('click',function(){
      irProc(td.getAttribute('data-proc'));
    });
  });
  var pages=Math.ceil(data.length/PAGE);
  var pag='';
  if(pages>1){
    pag='Pag '+(ppg+1)+'/'+pages+'&nbsp;&nbsp;';
    if(ppg>0)pag+='<span class="pag-btn" data-d="-1" style="color:#CAFF00;cursor:pointer;margin-right:8px;">Anterior</span>';
    if(ppg<pages-1)pag+='<span class="pag-btn" data-d="1" style="color:#CAFF00;cursor:pointer;">Proxima</span>';
  }
  var pelm=document.getElementById('proc-pag');
  pelm.innerHTML=pag;
  pelm.querySelectorAll('.pag-btn').forEach(function(btn){
    btn.addEventListener('click',function(){mudaPag(+btn.getAttribute('data-d'));});
  });
}
function irProc(proc){
  aba('proc',document.querySelectorAll('.tab')[1]);
  document.getElementById('sinp').value=proc;
  buscar();
  window.scrollTo(0,0);
}

function renderVar(){
  var m1v=document.getElementById('vm1').value;
  var m2v=document.getElementById('vm2').value;
  var arm=document.getElementById('varm').value;
  var dest=document.getElementById('vdest').value;
  function okV(r){return okFCL(r)&&(!arm||r.armador===arm)&&(!dest||r.destino===dest);}
  function pm(v){if(!v)return null;var p=v.split('-');return{ano:+p[0],mes:+p[1]};}
  var p1=pm(m1v),p2=pm(m2v);
  var d1=p1?RAW.filter(function(r){return okV(r)&&r.ano===p1.ano&&r.mes===p1.mes;}):[];
  var d2=p2?RAW.filter(function(r){return okV(r)&&r.ano===p2.ano&&r.mes===p2.mes;}):[];
  var t1=d1.reduce(function(s,r){return s+r.teus;},0);
  var t2=d2.reduce(function(s,r){return s+r.teus;},0);
  var vp=pct(t1,t2);
  var abs=Math.round(t2-t1);
  var lb1=p1?(MP[p1.mes]+'/'+p1.ano):'-';
  var lb2=p2?(MP[p2.mes]+'/'+p2.ano):'-';
  function kv(cl,lbl,val,sup,sub,sc2){
    return '<div class="kpi '+cl+'"><div class="klbl">'+lbl+'</div>'
      +'<div class="kval">'+val+(sup?'<sup>'+sup+'</sup>':'')+'</div>'
      +'<div class="ksub '+sc2+'">'+sub+'</div></div>';
  }
  document.getElementById('var-kpis').innerHTML=
    kv('kb','TEUs '+lb1,fmt(t1),'','base','neu')+
    kv('kg','TEUs '+lb2,fmt(t2),'',t2>=t1?'+'+fmt(abs)+' TEUs':'-'+fmt(-abs)+' TEUs',t2>=t1?'pos':'neg')+
    kv(vp>=0?'kg':'kr','Variacao',vp!==null?(vp>=0?'+':'')+vp+'%':'-','','de TEUs',vp>=0?'pos':'neg')+
    kv('kz','Processos',d1.length+' vs '+d2.length,'','comparativo','neu');

  var allD=RAW.filter(okV);var maxS=0;
  var allAM=[];
  for(var ay=2025;ay<=2026;ay++){for(var am=1;am<=12;am++)allAM.push([ay,am]);}
  allAM.forEach(function(am){
    var t=allD.filter(function(r){return r.ano===am[0]&&r.mes===am[1];}).reduce(function(s,r){return s+r.teus;},0);
    if(t>maxS)maxS=t;
  });
  if(!maxS)maxS=1;
  var hb='';
  allAM.forEach(function(am){
    var tot=allD.filter(function(r){return r.ano===am[0]&&r.mes===am[1];}).reduce(function(s,r){return s+r.teus;},0);
    if(!tot)return;
    var w=Math.round(tot/maxS*100);
    var hl=(p1&&p1.ano===am[0]&&p1.mes===am[1])||(p2&&p2.ano===am[0]&&p2.mes===am[1]);
    hb+='<div class="brow">'
      +'<div class="blbl" style="width:44px;'+(hl?'color:#CAFF00;font-weight:700;':'')+'">'+MP[am[1]]+'/'+String(am[0]).slice(2)+'</div>'
      +'<div class="bwrap"><div class="bsr"><div class="btr">'
      +'<div class="bf" style="width:'+w+'%;background:'+(am[0]===2025?'#2f5a8a':'#CAFF00')+';opacity:'+(hl?'1':'.5')+'"></div>'
      +'</div><div class="bnum" style="'+(hl?'color:#CAFF00;':'')+'">'+fmt(tot)+'</div></div></div></div>';
  });
  document.getElementById('var-bar').innerHTML=hb||'<div style="color:#222;padding:12px;">Selecione os periodos acima</div>';

  function tblC(campo,elId){
    var m1={},m2={};
    grp(d1,campo).forEach(function(e){m1[e[0]]=e[1];});
    grp(d2,campo).forEach(function(e){m2[e[0]]=e[1];});
    var keys=Object.keys(Object.assign({},m1,m2));
    var rows=keys.map(function(k){return{nm:k,v1:m1[k]||0,v2:m2[k]||0};})
      .sort(function(a,b){return b.v2-a.v2;}).slice(0,10);
    var h='<thead><tr><th>'+campo+'</th><th class="r">'+lb1+'</th><th class="r">'+lb2+'</th><th class="r">Var%</th></tr></thead><tbody>';
    rows.forEach(function(r){
      var nm=r.nm.length>22?r.nm.slice(0,20)+'...':r.nm;
      h+='<tr><td><span class="nm">'+nm+'</span></td>'
        +'<td class="r">'+(r.v1?fmt(r.v1):'-')+'</td>'
        +'<td class="r">'+(r.v2?fmt(r.v2):'-')+'</td>'
        +'<td class="r">'+cv(pct(r.v1,r.v2))+'</td></tr>';
    });
    document.getElementById(elId).innerHTML=h+'</tbody>';
  }
  tblC('armador','var-arm');tblC('destino','var-dest');tblC('mercadoria','var-merc');
}

function rLista(campo,listId,txtId,anoId){
  var txt=(document.getElementById(txtId).value||'').toLowerCase();
  var ano=document.getElementById(anoId).value;
  var m={};
  RAW.filter(function(r){
    return okFCL(r)&&r[campo]&&(!ano||String(r.ano)===ano)&&(!txt||r[campo].toLowerCase().indexOf(txt)>=0);
  }).forEach(function(r){m[r[campo]]=(m[r[campo]]||0)+r.teus;});
  var rows=Object.entries(m).sort(function(a,b){return b[1]-a[1];}).slice(0,30);
  var max=rows.length?rows[0][1]:1;
  var h='';
  rows.forEach(function(e,i){
    var nm=e[0],v=e[1];
    var w=Math.round(v/max*100);
    var cor=MC[i%MC.length];
    var sh=nm.length>32?nm.slice(0,30)+'...':nm;
    h+='<div class="eitem" data-campo="'+campo+'" data-idx="'+i+'" style="border-bottom:1px solid #111;">'
      +'<div class="erk '+(i<3?'top':'')+'">'+( i+1)+'</div>'
      +'<div class="enm" title="'+nm+'">'+sh+'</div>'
      +'<div class="ebar"><div class="ebar-f" style="width:'+w+'%;background:'+cor+'"></div></div>'
      +'<div class="eteu">'+fmt(v)+'</div>'
      +'<div class="earr">&#8250;</div></div>';
  });
  var container=document.getElementById(listId);
  container.innerHTML=h||'<div style="color:#222;padding:16px;text-align:center;">Nenhum resultado</div>';

  var _rows=rows;
  container.querySelectorAll('.eitem').forEach(function(el){
    el.addEventListener('click',function(){
      var idx=+el.getAttribute('data-idx');
      var cmp=el.getAttribute('data-campo');
      abrirDet(cmp,_rows[idx][0]);
    });
    el.style.cursor='pointer';
  });
}
function rExpList(){rLista('exportador','list-exp','exp-txt','exp-ano');}
function rCliList(){rLista('cliente','list-cli','cli-txt','cli-ano');}

function abrirDet(campo,nome){
  var data=RAW.filter(function(r){return okFCL(r)&&r[campo]===nome;});
  var t25=0,t26=0;
  data.forEach(function(r){if(r.ano===2025)t25+=r.teus;else if(r.ano===2026)t26+=r.teus;});
  var tot=t25+t26;
  var vp=pct(t25,t26);
  var lbl=campo==='exportador'?'Exportador':'Cliente';
  document.getElementById('det-nm').textContent=nome;
  document.getElementById('det-sub').textContent=lbl+' \u00b7 '+data.length+' processos';
  document.getElementById('det-kpis').innerHTML=
    '<div class="dk"><div class="dkl">Total TEUs</div><div class="dkv ac">'+fmt(tot)+'</div></div>'
    +'<div class="dk"><div class="dkl">TEUs 2025</div><div class="dkv">'+fmt(t25)+'</div></div>'
    +'<div class="dk"><div class="dkl">TEUs 2026</div><div class="dkv">'+fmt(t26)+'</div></div>'
    +'<div class="dk"><div class="dkl">Variacao</div><div class="dkv" style="color:'
    +(vp===null?'#444':vp>=0?'#CAFF00':'#ff5555')+'">'
    +(vp!==null?(vp>=0?'+':'')+vp+'%':'N/D')+'</div></div>';

  var mRota={};
  data.forEach(function(r){
    var k=(r.origem||'-')+' > '+(r.destino||'-');
    if(!mRota[k])mRota[k]={teus:0,arms:{}};
    mRota[k].teus+=r.teus;
    mRota[k].arms[r.armador]=(mRota[k].arms[r.armador]||0)+r.teus;
  });
  var rotas=Object.entries(mRota).sort(function(a,b){return b[1].teus-a[1].teus;}).slice(0,10);
  var maxR=rotas.length?rotas[0][1].teus:1;
  var lRota='';
  rotas.forEach(function(e){
    var rota=e[0],info=e[1];
    var w=Math.round(info.teus/maxR*100);
    var topA=Object.entries(info.arms).sort(function(a,b){return b[1]-a[1];})[0];
    var aN=topA?topA[0].split(' ').slice(0,2).join(' '):'';
    lRota+='<div style="padding:6px 0;border-bottom:1px solid #111;">'
      +'<div style="display:flex;align-items:center;gap:7px;margin-bottom:3px;">'
      +'<div style="flex:1;font-size:11px;color:#ccc;">'+rota+'</div>'
      +'<div style="font-size:11px;color:#CAFF00;font-weight:700;">'+fmt(info.teus)+'</div></div>'
      +'<div style="display:flex;align-items:center;gap:5px;">'
      +'<div style="flex:1;height:3px;background:#111;border-radius:2px;overflow:hidden;">'
      +'<div style="width:'+w+'%;height:100%;background:#CAFF00;"></div></div>'
      +'<div style="font-size:9px;color:#333;white-space:nowrap;">via '+aN+'</div></div></div>';
  });

  var mArm={};
  data.forEach(function(r){mArm[r.armador]=(mArm[r.armador]||0)+r.teus;});
  var arms=Object.entries(mArm).sort(function(a,b){return b[1]-a[1];});
  var maxA=arms.length?arms[0][1]:1;
  var lArm='';
  arms.forEach(function(e,i){
    var nm=e[0],v=e[1];
    var w=Math.round(v/maxA*100);
    var p2=Math.round(v/tot*100);
    var cor=MC[i%MC.length];
    var sh=nm.length>24?nm.slice(0,22)+'...':nm;
    lArm+='<div style="margin-bottom:8px;">'
      +'<div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px;">'
      +'<span style="color:#ccc;">'+sh+'</span>'
      +'<span style="color:#777;">'+fmt(v)+' <span style="color:#333;">('+p2+'%)</span></span></div>'
      +'<div style="height:4px;background:#111;border-radius:2px;overflow:hidden;">'
      +'<div style="width:'+w+'%;height:100%;background:'+cor+';border-radius:2px;"></div></div></div>';
  });

  document.getElementById('det-body').innerHTML=
    '<div class="dcol"><div class="dctitle">Top rotas (Origem &gt; Destino)</div>'+lRota+'</div>'
    +'<div class="dcol"><div class="dctitle">Armadores utilizados</div>'+lArm+'</div>';
  document.getElementById('overlay').classList.add('on');
}
function fecharDet(ev){
  if(ev.target===document.getElementById('overlay'))document.getElementById('overlay').classList.remove('on');
}

function aba(pg,el){
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('on');});
  document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('on');});
  document.getElementById('page-'+pg).classList.add('on');
  el.classList.add('on');
  if(pg==='proc')listaProc();
  if(pg==='var')renderVar();
  if(pg==='exp'){rExpList();rCliList();}
}

document.getElementById('data-ger').textContent='Gerado em '+new Date().toLocaleDateString('pt-BR');
document.getElementById('hdr-total').textContent=RAW.length.toLocaleString('pt-BR');
popularSelects();
render();
