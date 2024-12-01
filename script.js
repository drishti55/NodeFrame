document.addEventListener('DOMContentLoaded', function() {
  // 1. Fade-in animation for elements when they scroll into view
  const fadeElements = document.querySelectorAll('.fade-in');

  const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add('visible');
          }
      });
  });

  fadeElements.forEach(el => observer.observe(el));

  // 2. Button bounce effect on hover
  const startMappingButton = document.querySelector("#home button");

  startMappingButton.addEventListener("mouseover", function() {
      startMappingButton.classList.add("bounce");
  });

  startMappingButton.addEventListener("mouseout", function() {
      startMappingButton.classList.remove("bounce");
  });
});

// Change navbar background on scroll
window.addEventListener("scroll", () => {
  const nav = document.querySelector(".nav");
  if (window.scrollY > 50) {
      nav.classList.add("scrolled");
  } else {
      nav.classList.remove("scrolled");
  }
});

document.addEventListener('DOMContentLoaded', function () {
    // Load JSON data for project details
    fetch('homepage.json')
        .then(response => response.json())
        .then(data => {
            // Populate project name and description
            document.querySelector('#home h1').innerText = `Unleash Your Ideas with ${data.name}`;
            document.querySelector('#home p').innerText = data.description;

            // Populate features dynamically
            const featureContainer = document.querySelector('.feature_container');
            featureContainer.innerHTML = ''; // Clear existing features

            data.features.forEach(feature => {
                const featureBox = document.createElement('div');
                featureBox.classList.add('feature_box');

                featureBox.innerHTML = `
                    <img src="${feature.icon}" alt="${feature.title}">
                    <h3>${feature.title}</h3>
                    <h6>${feature.description}</h6>
                `;
                
                featureContainer.appendChild(featureBox);
            });
        })
        .catch(error => console.error('Error loading JSON:', error));

    //  JavaScript code...
});
