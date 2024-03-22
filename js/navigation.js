const elements = {
  links: [...document.querySelectorAll(".navigator-link")],
  views: [...document.querySelectorAll(".view")],
};

let currentView = "catalog";

function toggleView(newView) {
  elements.views.forEach((element) => (element.style.display = "none"));
  const newViewElement = elements.views.find(
    (element) => element.dataset.view === newView
  );

  newViewElement.style.display = "flex";
}

elements.links.forEach((link) => {
  link.onclick = (event) => {
    event.preventDefault();
    toggleView(link.dataset.redirect);
  };
});

toggleView(currentView);
