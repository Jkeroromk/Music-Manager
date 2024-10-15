function toggleModal() {
    document.body.classList.toggle("model__open");
  }
  
  let contrastToggle = false;
  function toggleContrast(){
    contrastToggle = !contrastToggle;
    if (contrastToggle) {
      document.body.classList += " dark-theme"
    }
    else {
      document.body.classList.remove("dark-theme")
    }
  }
// TOggle color theme

const coords = { x: 0, y: 0 };
const circles = document.querySelectorAll(".circle");

const cursor = document.querySelector(".cursor");

circles.forEach(function (circle, index) {
  circle.x = 0;
  circle.y = 0;
  circle.style.backgroundColor = "white";
});

window.addEventListener("mousemove", function (e) {
  coords.x = e.clientX;
  coords.y = e.clientY;
});

function animateCircles() {
  let x = coords.x;
  let y = coords.y;

  cursor.style.top = x;
  cursor.style.left = y;
  
  circles.forEach(function (circle, index) {
    circle.style.left = x - 12 + "px";
    circle.style.top = y - 12 + "px";

    circle.style.scale = (circles.length - index) / circles.length;

    circle.x = x;
    circle.y = y;

    const nextCircle = circles[index + 1] || circles[0];
    x += (nextCircle.x - x) * 0.3;
    y += (nextCircle.y - y) * 0.3;
  });

  requestAnimationFrame(animateCircles);
}

animateCircles();

// ANIMATE CUSOR

document.addEventListener('DOMContentLoaded', function() {
  const searchButton = document.getElementById('searchButton');
  const searchInput = document.getElementById('searchInput');
  let errorMessage = '';

  searchButton.addEventListener('click', function(event) {
      event.preventDefault(); // Prevent form submission

      // Remove existing error message if any
      if (errorMessage) {
          errorMessage.remove();
          errorMessage = null;
      }

      if (searchInput.value.trim() === '') {
          // Create and display error message
          errorMessage = document.createElement('div');
          errorMessage.textContent = 'Please enter a search term';
          errorMessage.style.color = 'red';
          errorMessage.style.marginTop = '5px';
          searchInput.parentNode.appendChild(errorMessage);

          // Focus on the input field
          searchInput.focus();
      }
  });
});

// f5eb93d5379d4b3b9dcbd6ea3d8d4a31 client id
// a46a3ac979964d9d8f3cb3152e3a1cbe client secret 