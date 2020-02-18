const searchStrEl = document.getElementById("search-term");
const searchByEl = document.getElementById("search-by");
// containers for showing search results
const resultHeaderEl = document.getElementById("result-header");
const resultContainerEl = document.getElementById("result-container");

function showAllRecords() {
  axios.get("/api/invoices/").then(res => {
    console.log("all invoices: ", res.data);
    showResultHTML(res.data, resultContainerEl)
  });
}
showAllRecords();


// adds click event to the button 'search'
document
  .getElementById("search-btn")
  .addEventListener("click", function (event) {
    const searchByValue = searchByEl.value;
    if (searchStrEl.value === "") {
      showAllRecords();
    } else {
      switch (searchByValue) {
        case "Invoice Number":
          axios.get(`/api/invoices/${searchStrEl.value}`).then(res => {
            console.log(res);
            showResultHTML(res.data, resultContainerEl);
          });
          break;

        // default is 'Sales Order Number'
        default:
          axios
            .get(
              `/invoices/search-by-salesorder/${parseInt(searchStrEl.value)}`
            )
            .then(res => showResultHTML(res.data, resultContainerEl));
      }
    }
  });

// function that renders html with the search results
function showResultHTML(data, resultContainer) {
  // shows the result header which was hidden on page load
  resultHeaderEl.setAttribute("class", "container-fluid");
  // const arrayData = [data];
  const innerHTML = data.map(function (invoice) {
    return `<div id=${invoice.id} class="row sub-report-text sub-report-row py-1  hyper-link-look result-js">
                <div class="col-3"> ${invoice.id}</div>
                <div class="col-3"> ${invoice.salesorder_id}</div>
                <div class="col-3"> ${moment(invoice.createdAt).format('MM/DD/YYYY')}</div>
                <div class="col-3 text-right"> ${invoice.total_amount}</div>
            </div>`;
  });
  resultContainer.innerHTML = innerHTML.join("\n");
  // add click event to each record of results
  const resultEl = document.querySelectorAll(".result-js");
  for (let i = 0; i < resultEl.length; i++) {
    resultEl[i].addEventListener("click", function (event) {
      const id = event.target.parentElement.getAttribute("id");
      sessionStorage.setItem("id", id);
      console.log("id: ", id);
      window.location.href = "./update-invoice.html";
    });
  }
}
