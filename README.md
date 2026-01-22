# Programming game

> [!IMPORTANT]
> The game itself is a clone of "The Farmer Was Replaced".
>
> I just wanted to learn Vue and decided to make some fun project.

The small game about writing JavaScript scripts and farming.

Can be run locally using bun:
```shell
bun dev
```

Unfortunately full documentation is not available at the moment.
There is only in-game autocompletion with minimal documentation in it.

In order to beat the game, player has to upgrade field up to 10x10 size and
sow every plant in the most effective way: using patterns and soil watering.

## Game Features

| Name | Status | Commentary |
| ---- | ------ | ---------- |
| Crop growth system | ✅ | |
| Seeds and economy system | ✅ | May require some balancing in order to make it more fun |
| Soil watering mechanics | ❌| |
| Player cooldown and action heaviness | ❌| May require rewrite of the game state ticking mechanism |
| Pattern-dependant crop growth speed | ❌| |
| World grid upgrade for resources | ❌| Technically already implemented, but without taking resources into account |

## Technical Features

| Name | Status |
| ---- | ------ |
| Code editor with memory among sessions | ✅ |
| Autocompletion for game api | ✅ |
| Non-blocking code executor | ✅ |
| Audio engine | ❌ |
