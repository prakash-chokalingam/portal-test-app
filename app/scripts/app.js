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
  renderDataFields();
}

function renderDataFields() {
  let $dataViewer = document.getElementById('data-viewer');
  let $dataSelector = document.getElementById('data-selector');

  let data = ['portal', 'user'];

  switch (client.context.location) {
    case 'portal_tickets_new_sidebar':
      data = [...data, 'ticket', 'requester', 'status_option', 'priority_options', 'ticket_type_options', 'customfield_options']
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
