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






// f5eb93d5379d4b3b9dcbd6ea3d8d4a31 client id
// a46a3ac979964d9d8f3cb3152e3a1cbe client secret 