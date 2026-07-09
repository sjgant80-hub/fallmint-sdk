// fallmint SDK · sovereign single-file library · MIT · AI-Native Solutions
// Extracted from fallmint/index.html · 10609 bytes of source logic
// Public-safe: no primes/glyphs/dyad references

  aiComplete: async () => null,
  openSettings: () => alert('fall-kit settings · T0 mechanical is the default and works for OpenAPI/GraphQL/gRPC/JSON:API/AsyncAPI/REST-curl inputs.\n\nT2 (WebLLM) and T3 (BYOK) upgrade paths available at https://sjgant80-hub.github.io/fall-kit/'),
  tier: 'T0'
};
import { FallMint } from './mint.js';
const state = { step:1, apiShape:null, bundles:null, sig:null, zips:null };
const mint = new FallMint({
  log: (m, cls) => {
    const log = $('#forgeLog'); if (!log) return;
    const line = document.createElement('div'); line.className = 'line ' + (cls||''); line.textContent = '· ' + m;
    log.appendChild(line); log.scrollTop = log.scrollHeight;
  }
});
// ─── Wiring ──────────────────────────────────────────
function goto(n) {
  state.step = n;
  $$('[data-view]').forEach(v => v.classList.toggle('hidden', v.dataset.view != n));
  $$('.step-chip').forEach(c => {
    c.classList.toggle('on', c.dataset.step == n);
    c.classList.toggle('done', c.dataset.step < n);
  });
}
$$('[data-goto]').forEach(b => b.addEventListener('click', () => goto(+b.dataset.goto)));
$$('.step-chip').forEach(c => c.addEventListener('click', () => { if (c.classList.contains('done') || c.classList.contains('on')) goto(+c.dataset.step); }));
$('#skipCascade').addEventListener('click', () => goto(2));
// ─── Examples ──────────────────────────────────────────
const EXAMPLES = {
  petstore: {
    type: 'openapi', vendor: 'swagger', service: 'petstore',
    source: JSON.stringify({
      openapi:'3.0.0', info:{title:'Swagger Petstore', version:'1.0.0', description:'A canonical example API for testing'},
      servers:[{url:'https://petstore.swagger.io/v2'}],
      paths:{
        '/pet':{
          post:{operationId:'addPet', summary:'Add a new pet to the store', requestBody:{content:{'application/json':{}}}, tags:['pet']},
          put:{operationId:'updatePet', summary:'Update an existing pet', requestBody:{content:{'application/json':{}}}, tags:['pet']}
        },
        '/pet/findByStatus':{ get:{operationId:'findPetsByStatus', summary:'Find pets by status', parameters:[{name:'status', in:'query', required:true, schema:{type:'string'}}], tags:['pet']} },
        '/pet/{petId}':{
          get:{operationId:'getPetById', summary:'Find pet by ID', parameters:[{name:'petId', in:'path', required:true, schema:{type:'integer'}}], tags:['pet']},
          delete:{operationId:'deletePet', summary:'Delete a pet', parameters:[{name:'petId', in:'path', required:true, schema:{type:'integer'}}], tags:['pet']}
        },
        '/store/order':{ post:{operationId:'placeOrder', summary:'Place an order for a pet', requestBody:{content:{'application/json':{}}}, tags:['store']} },
        '/store/order/{orderId}':{ get:{operationId:'getOrderById', summary:'Find order by ID', parameters:[{name:'orderId', in:'path', required:true, schema:{type:'integer'}}], tags:['store']} },
        '/user':{ post:{operationId:'createUser', summary:'Create user', requestBody:{content:{'application/json':{}}}, tags:['user']} },
        '/user/login':{ get:{operationId:'loginUser', summary:'Log user in', parameters:[{name:'username', in:'query', required:true, schema:{type:'string'}},{name:'password', in:'query', required:true, schema:{type:'string'}}], tags:['user']} }
      },
      components:{securitySchemes:{api_key:{type:'apiKey', name:'api_key', in:'header'}}}
    }, null, 2)
  },
  stripe: {
    type:'openapi', vendor:'stripe', service:'billing',
    source: JSON.stringify({
      openapi:'3.0.0', info:{title:'Stripe Billing lite', version:'2024-01-01'},
      servers:[{url:'https://api.stripe.com/v1'}],
      paths:{
        '/customers':{ post:{operationId:'createCustomer', summary:'Create a customer'}, get:{operationId:'listCustomers', summary:'List customers'} },
        '/customers/{id}':{ get:{operationId:'retrieveCustomer', summary:'Retrieve a customer', parameters:[{name:'id', in:'path', required:true}]} },
        '/payment_intents':{ post:{operationId:'createPaymentIntent', summary:'Create a PaymentIntent'} },
        '/invoices':{ post:{operationId:'createInvoice', summary:'Create an invoice'}, get:{operationId:'listInvoices', summary:'List invoices'} }
      },
      components:{securitySchemes:{bearer:{type:'http', scheme:'bearer'}}}
    }, null, 2)
  },
  notion: {
    type:'rest', vendor:'notion', service:'pages',
    source: `curl -X GET "https://api.notion.com/v1/databases/abc123" -H "Authorization: Bearer $TOKEN"
curl -X POST "https://api.notion.com/v1/pages" -H "Authorization: Bearer $TOKEN" -d '{...}'
curl -X PATCH "https://api.notion.com/v1/pages/xyz789" -H "Authorization: Bearer $TOKEN" -d '{...}'
curl -X POST "https://api.notion.com/v1/search" -H "Authorization: Bearer $TOKEN" -d '{...}'`
  }
};
$$('.example-line').forEach(el => el.addEventListener('click', () => {
  const ex = EXAMPLES[el.dataset.ex];
  $('#inputType').value = ex.type;
  $('#vendorName').value = ex.vendor;
  $('#serviceName').value = ex.service;
  $('#inputSource').value = ex.source;
}));
// ─── Parse ──────────────────────────────────────────
$('#parseBtn').addEventListener('click', async () => {
  try {
    const type = $('#inputType').value;
    const src = $('#inputSource').value.trim();
    if (!src) { alert('Paste a source (URL or spec text) first.'); return; }
    const parsed = await mint.parseInput(type, src);
    state.apiShape = parsed;
    $('#parsePreview').textContent = JSON.stringify({
      kind: parsed.kind, title: parsed.title, baseURL: parsed.baseURL, auth: parsed.auth,
      operationCount: parsed.operationCount, operations: (parsed.operations||[]).slice(0,10)
    }, null, 2);
    $('#opsCountPill').textContent = parsed.operationCount;
    $('#authPill').textContent = parsed.auth?.type || 'none';
    goto(3);
  } catch (e) { alert('Parse failed: ' + e.message); }
});
// ─── Forge ──────────────────────────────────────────
$('#forgeBtn').addEventListener('click', async () => {
  goto(4);
  $('#forgeLog').innerHTML = '';
  $('#repoGrid').innerHTML = '';
  $('#signBtn').disabled = true;
  const vendor = ($('#vendorName').value.trim() || state.apiShape.title.split(/\s|-/)[0] || 'vendor').toLowerCase().replace(/[^a-z0-9-]/g,'');
  const service = ($('#serviceName').value.trim() || 'service').toLowerCase().replace(/[^a-z0-9-]/g,'');
  try {
    await mint.loadExemplars();
    const [sdk, api, mcp] = await Promise.all([
      mint.forgeSDK(vendor, service, state.apiShape),
      mint.forgeAPI(vendor, service, state.apiShape),
      mint.forgeMCP(vendor, service, state.apiShape)
    ]);
    state.bundles = { sdk, api, mcp, vendor, service };
    for (const b of [sdk, api, mcp]) {
      const card = document.createElement('div'); card.className = 'repo-card';
      card.innerHTML = `<h4>${b.name}</h4><div class="files">${Object.keys(b.files).sort().map(f => `· ${f}`).join('<br>')}</div><div class="stats">${Object.keys(b.files).length} files · ${Object.values(b.files).reduce((a,f)=>a+(f.length||0),0).toLocaleString()} bytes</div>`;
      $('#repoGrid').appendChild(card);
    }
    mint.log('all three bundles forged', 'info');
    $('#signBtn').disabled = false;
  } catch (e) { mint.log('forge error: ' + e.message, 'err'); }
});
// ─── Sign ──────────────────────────────────────────
$('#signBtn').addEventListener('click', async () => {
  goto(5);
  const { sdk, api, mcp } = state.bundles;
  const sig = await mint.signTriplet(sdk, api, mcp);
  state.sig = sig;
  const rows = [
    ['Public key (Ed25519 SPKI, base64)', sig.pubkey || 't0 · unsigned (WebCrypto Ed25519 unavailable in this browser)'],
    [sdk.name + ' · sha256', sig.sdk.sha256],
    [sdk.name + ' · sig',    sig.sdk.sig],
    [api.name + ' · sha256', sig.api.sha256],
    [api.name + ' · sig',    sig.api.sig],
    [mcp.name + ' · sha256', sig.mcp.sha256],
    [mcp.name + ' · sig',    sig.mcp.sig],
    ['Lineage', 'parent: fallmint · chain: KCC · vendor: ' + state.bundles.vendor + ' · service: ' + state.bundles.service]
  ];
  $('#sigOut').innerHTML = rows.map(([k,v]) => `<div class="sig-block"><span class="k">${k}</span><span class="v">${v}</span></div>`).join('');
});
// ─── Ship ──────────────────────────────────────────
$('#shipBtn').addEventListener('click', () => {
  goto(6);
  const { sdk, api, mcp, vendor, service } = state.bundles;
  state.zips = mint.packageAsZips([sdk, api, mcp]);
  $('#zipList').innerHTML = state.zips.map((z,i) => `<button class="btn" data-zip="${i}">↓ ${z.name}</button>`).join('') + ` <button class="btn ghost" id="dlManifest">↓ fallharbor-patch.json</button>`;
  $$('#zipList [data-zip]').forEach(b => b.addEventListener('click', () => {
    const z = state.zips[+b.dataset.zip];
    const url = URL.createObjectURL(z.blob);
    const a = document.createElement('a'); a.href = url; a.download = z.name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }));
  $('#dlManifest').addEventListener('click', () => {
    const patch = { patches:[{op:'add', entries:[
      {name:sdk.name, kind:'sdk', parent:'fallmint', vendor, service},
      {name:api.name, kind:'api', parent:'fallmint', vendor, service},
      {name:mcp.name, kind:'mcp', parent:'fallmint', vendor, service}
    ]}], sig: state.sig };
    const blob = new Blob([JSON.stringify(patch, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='fallharbor-patch.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  });
  $('#shipCmds').textContent = mint.emitShipCommands(vendor, service);
});
$('#copyShipBtn').addEventListener('click', async () => {
  await navigator.clipboard.writeText($('#shipCmds').textContent);
  $('#copyShipBtn').textContent = 'COPIED ✓';
  setTimeout(() => $('#copyShipBtn').textContent = 'COPY SHIP COMMANDS', 1600);
});
$('#restartBtn').addEventListener('click', () => { state.apiShape=null; state.bundles=null; state.sig=null; state.zips=null; $('#inputSource').value=''; goto(2); });
// pre-load petstore example so the "worked example" is one click
// register SW (best-effort)
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});

// Named exports for the primary API surface
export { goto };
export { $ };
export { $$ };

export { EXAMPLES };
