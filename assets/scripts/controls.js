export class Controls {
  constructor() {
      this.keys = {
          'ArrowUp': false,
          'ArrowDown': false,
          'ArrowLeft': false,
          'ArrowRight': false,
          'w': false,
          'a': false,
          's': false,
          'd': false,
          'Enter': false,
          'Escape': false,
          'Space': false
      };

      document.addEventListener('keydown', (e) => {
          if (this.keys.hasOwnProperty(e.key)) {
              this.keys[e.key] = true;
          }
      });

      document.addEventListener('keyup', (e) => {
          if (this.keys.hasOwnProperty(e.key)) {
              this.keys[e.key] = false;
          }
      });
  }
}