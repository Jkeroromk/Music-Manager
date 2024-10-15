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

function openMenu(){
    document.body.classList += " menu--open"
}

function closeMenu(){
    document.body.classList.remove('menu--open')
}

document.addEventListener('DOMContentLoaded', function() {
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        const questionBar = question.querySelector('.question-bar');

        questionBar.addEventListener('click', () => {
            const isActive = question.classList.contains('active');

            // Close all other questions
            faqQuestions.forEach(q => {
                if (q !== question) {
                    q.classList.remove('active');
                }
            });

            // Toggle the clicked question
            question.classList.toggle('active');
        });
    });
});

  

// f5eb93d5379d4b3b9dcbd6ea3d8d4a31 client id
// a46a3ac979964d9d8f3cb3152e3a1cbe client secret 