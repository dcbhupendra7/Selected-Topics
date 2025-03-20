# Frequently Asked Questions

## General

**1. What is Flappy Bird Neuro-Evolution?**  
It's a fun version of Flappy Bird where the bird learns by using AI (Genetic Algorithms + Neural Networks) to avoid pipes.

**2. Do I need to code to use this?**  
No! You can run the game in your browser. If you want to tweak or explore how it works, then some coding knowledge helps.

## AI Basics

**3. What is a Genetic Algorithm?**  
A way for our birds to "evolve" over time. The best birds pass on their abilities to the next generation.

**4. What is a Neural Network?**  
It's like a mini brain for the bird. It decides when to flap based on inputs (like pipe distance).

## Customizing the Game

**5. How do I change the speed of the pipes?**  
In the code, look for `Pipe`'s `speed` variable and change it to a higher or lower number.

**6. Can I replace the bird with my own image?**  
Yes! Just swap out `bird.png` in the same folder with your own file (same name or update the code to point to your new image).

## Troubleshooting

**7. The background doesn't show.**  
Check if `background.png` is in the same folder and that your code has `image(bgImage, 0, 0, width, height);` in `draw()`.

**8. The game runs very slowly.**  
Try reducing the population size or frames per second to lighten the computation load.

## More Resources

**9. Where can I learn more?**

- [The Coding Train](https://thecodingtrain.com/) for fun video tutorials.
- [Khan Academy](https://www.khanacademy.org/computing) for computer programming basics.
