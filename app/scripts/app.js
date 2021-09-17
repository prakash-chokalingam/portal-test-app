document.onreadystatechange = function () {
  if (document.readyState === 'interactive') renderApp();

  function renderApp() {
    var onInit = app.initialized();

    onInit.then(getClient).catch(handleErr);

    function getClient(_client) {
      window.client = _client;
      client.events.on('app.activated', onAppActivate);
    }
  }
};

function onAppActivate() {
  renderDataApis();
  renderInterfaceApis();
  renderEventApis();
}


function renderInterfaceApis() {
  let $interfaceViewer = document.getElementById('interface-viewer');
  let $interfaceSelector = document.getElementById('interface-selector');
  let $interfaceOptions = document.getElementById('interface-options');

  let interfaces = ['showNotify', 'showConfirm'];

  switch (client.context.location) {
    case 'portal_tickets_new_sidebar':
      interfaces = [...interfaces, 'show', 'hide', 'enable', 'disable', 'setRequired', 'setValue', 'setOptions']
      break;

    default:
      break;
  }

  interfaces.forEach((option) => {
    let $option = document.createElement('option');
    $option.value = option;
    $option.innerHTML = option;

    $interfaceSelector.add($option);
  });

  $interfaceSelector.addEventListener('change', async function(e) {
    let value = e.currentTarget.value;
    if (value === 'null') { $interfaceViewer.innerHTML = '---'; return true }

    $interfaceViewer.innerHTML = `Triggered interface event: ${value}`;

    try {
      const options = JSON.parse($interfaceOptions.value);
      console.log('stringified', options);
      const data = await client.interface.trigger(value, options);
      console.log(data)
      $interfaceViewer.innerHTML = JSON.stringify(data, {}, 4);
    } catch (error) {
      console.log(error);
      $interfaceViewer.innerHTML = 'Something went wrong';
    }
  })

}

function renderEventApis() {
 let $eventViewer = document.getElementById('events-viewer');
 let $iBlock = document.getElementById('interceptor-block');

  let events = [];
  let interceptEvents = [];

  switch (client.context.location) {
    case 'portal_tickets_new_sidebar':
      events = [...events, 'ticket.change']
      interceptEvents = [...interceptEvents, 'ticket.submit']
      break;

    default:
      break;
  }


  const eventCallback = (intercept, event) => {
    let content = `Received event: ${event.type}\n\n`;
    let data = event.helper.getData();
    content = `${content} --data \n ${JSON.stringify(data, {}, 4)}`;
    $eventViewer.innerHTML = content;

    if (intercept) {
      $iBlock.innerHTML = ''; // clear

      // cancel
      let $continueBtn = document.createElement('button');
      $continueBtn.classList.add('continue');
      $continueBtn.innerHTML = `continue`;
      $continueBtn.addEventListener('click', () => $iBlock.innerHTML = '' && event.helper.done());

        // continue
      let $cancelBtn = document.createElement('button');
      $cancelBtn.classList.add('cancel');
      $cancelBtn.innerHTML = `cancel`;
      $cancelBtn.addEventListener('click', () => $iBlock.innerHTML = '' && event.helper.fail('failed'));

      $iBlock.appendChild($cancelBtn);
      $iBlock.appendChild($continueBtn);
    }
  }

  events.forEach((event) => {
    console.log('Registered event', event);
    client.events.on(event, eventCallback.bind(this, false));
  });

  interceptEvents.forEach((event) => {
    console.log('Registered intercept event', event);
    client.events.on(event, eventCallback.bind(this, true), {intercept: true });
  });
}

function renderDataApis() {
  let $dataViewer = document.getElementById('data-viewer');
  let $dataSelector = document.getElementById('data-selector');

  let data = ['portal', 'user'];

  switch (client.context.location) {
    case 'portal_tickets_new_sidebar':
      data = [...data, 'ticket', 'requester', 'status_options', 'priority_options', 'ticket_type_options', 'cf_custom_options']
      break;

    default:
      break;
  }


  data.forEach((option) => {
    let $option = document.createElement('option');
    $option.value = option;
    $option.innerHTML = option;

    $dataSelector.add($option);
  });

  $dataSelector.addEventListener('change', async function(e) {
    let value = e.currentTarget.value;
    if (value === 'null') { $dataViewer.innerHTML = '---'; return true }

    try {
      const data = await client.data.get(value);
      $dataViewer.innerHTML = JSON.stringify(data, {}, 4);
    } catch (error) {
      console.log(error);
      $dataViewer.innerHTML = 'Something went wrong';
    }
  })
}

function handleErr(err) {
  console.error(`Error occured. Details:`, err);
}
