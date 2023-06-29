"use strict";
//----------------------------------------------
//--------------Tunable Values------------------
//----------------------------------------------
const numPlanets = 5; //number of planets that the game should have
const numTimePeriods = 10; //stores how many time periods each planet should have
const timePeriodBoardShift = 40;
const planetLabelHeight = 30; //how tall the planet's name should be at the top of the display
const planetOverviewWidth = 60; //how wide the column that shows a particular planet should be drawn
const timePeriodOverviewHeight = 70; //how tall the box that shows the time period overview should be
const planetLabelFont = "15px Arial";
const boardNumberLabelWidth = 30;
//----------------------------------------------
//------------------Classes---------------------
//----------------------------------------------
class Button {
    na_position;
    na_size;
    s_color;
    s_textColor;
    s_font;
    na_textOffset;
    s_text;
    f_action;
    constructor(c_position, c_size, c_color, c_textColor, c_font, c_textOffset, c_text, c_action) {
        this.na_position = c_position;
        this.na_size = c_size;
        this.s_color = c_color;
        this.s_textColor = c_textColor;
        this.s_font = c_font;
        this.na_textOffset = c_textOffset;
        this.s_text = c_text;
        this.f_action = c_action;
    }
    Draw = () => {
        //draws the button
        context.fillStyle = this.s_color;
        context.fillRect(this.na_position[0], this.na_position[1], this.na_size[0], this.na_size[1]);
        //draws the text on the button
        context.fillStyle = this.s_textColor;
        context.font = this.s_font;
        context.fillText(this.s_text, this.na_position[0] + this.na_textOffset[0], this.na_position[1] + this.na_textOffset[1]);
    };
    OnClick = () => {
        this.f_action();
    };
}
class Player {
    ta_troops;
    n_resources;
    constructor() {
        this.ta_troops = [];
        this.n_resources = 0;
    }
    Trade = (p_troopsIn, p_resourcesIn, p_troopsOut, p_resourcesOut) => {
        p_troopsIn.forEach((t) => this.ta_troops.push(t)); //take all the troops that are being added from the players inventory and add them to the time period
        //TODO: remove any troops that are being moved out
        this.n_resources += p_resourcesIn; //add any resources that are being moved into the time period
        this.n_resources -= p_resourcesOut; //subtract any resources that are being moved out
    };
}
class Troop {
}
class Building {
}
class TimePeriod {
    n_level;
    n_modifier;
    n_resources;
    ba_buildings;
    ta_troops;
    constructor(c_level, c_modifier) {
        this.n_level = c_level;
        this.n_modifier = c_modifier;
        if (c_modifier < 1) {
            this.n_modifier = Math.floor(c_modifier * 100) * 0.01;
        }
        else {
            this.n_modifier = Math.floor(c_modifier);
        }
        this.n_resources = 0;
        this.ba_buildings = [];
        this.ta_troops = [];
    }
    Trade = (p_troopsIn, p_resourcesIn, p_troopsOut, p_resourcesOut) => {
        p_troopsIn.forEach((t) => this.ta_troops.push(t)); //take all the troops that are being added from the players inventory and add them to the time period
        //TODO: remove any troops that are bing moved out
        this.n_resources += p_resourcesIn; //add any resources that are being moved into the time period
        this.n_resources -= p_resourcesOut; //subtract any resources that are being moved out
    };
    Draw = (p_widthOffset, p_heightOffset, p_planetsIndex, p_timePeriodIndex) => {
        context.fillStyle = "white"; //sets the fill color to a white
        context.fillRect(p_widthOffset, p_heightOffset, planetOverviewWidth, timePeriodOverviewHeight); //draws a white square over the area where the planet is to be drawn
        context.strokeStyle = "black"; //sets the stroke color to a black
        context.lineWidth = 3; //sets the width of the stroke line
        if (p_planetsIndex === n_selectedPlanetIndex && p_timePeriodIndex === n_selectedTimePeriodIndex) { //checks if the current time period is the one that the player has selected
            context.strokeStyle = "red"; //sets the stroke color to a red
            context.lineWidth = 4; //sets the width of the stroke line
        }
        context.strokeRect(p_widthOffset, p_heightOffset, planetOverviewWidth, timePeriodOverviewHeight); //draws a black square around the area where the planet is to be drawn
    };
}
class Planet {
    s_name;
    ta_timePeriods;
    constructor(c_name) {
        this.s_name = c_name;
        //generate the time periods
        this.ta_timePeriods = [];
        for (let i = 0; i < numTimePeriods; i++) {
            this.ta_timePeriods.push(new TimePeriod(Math.pow(2, i), Math.random() * (0.05 * Math.pow(2, i))));
        }
    }
    Draw = (p_widthOffset, p_planetIndex) => {
        //draws a label of the planets name at the top
        context.fillStyle = "white"; //sets the fill color to a white
        context.fillRect(p_widthOffset + timePeriodBoardShift, timePeriodBoardShift - planetLabelHeight, planetOverviewWidth, planetLabelHeight);
        context.strokeStyle = "black"; //sets the stroke color to a black
        context.lineWidth = 3; //sets the width of the stroke line
        context.strokeRect(p_widthOffset + timePeriodBoardShift, timePeriodBoardShift - planetLabelHeight, planetOverviewWidth, planetLabelHeight); //draws the background for the planet's name
        context.font = planetLabelFont; //makes sure that the planet label font is set properly
        context.fillStyle = "black"; //sets the fill color to a black
        context.fillText(`${this.s_name}`, timePeriodBoardShift + 2 + (p_planetIndex * planetOverviewWidth), timePeriodBoardShift - 10);
        for (let i = 0; i < this.ta_timePeriods.length; i++) { //lops through all of the time periods of this planet and runs their draw function
            this.ta_timePeriods[i].Draw(p_widthOffset + timePeriodBoardShift, (timePeriodOverviewHeight * i) + timePeriodBoardShift, p_planetIndex, i); //draws a border around the label of the planet's name
        }
    };
}
//----------------------------------------------
//-------------MAIN GAME LOGIC------------------
//----------------------------------------------
let pa_planets = [];
let n_selectedPlanetIndex = -1;
let n_selectedTimePeriodIndex = -1;
//gets the canvas and context from the HTML Page to be used to draw the game to the canvas on the page
const canvas = document.getElementById("viewport");
const context = canvas.getContext('2d');
const ba_buttons = []; //list to store all of the buttons that need to be drawn to the screen
const b_testButton = new Button([400, 50], [152, 30], "green", "white", "20px Arial", [10, 22], "Debug Planets", () => DebugPlanets());
ba_buttons.push(b_testButton);
const CheckForPressed = (e) => {
    //finds the position on the canvas where the player clicked
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ba_buttons.forEach((b) => {
        if ((x > b.na_position[0] && x < b.na_position[0] + b.na_size[0]) && (y > b.na_position[1] && y < b.na_position[1] + b.na_size[1])) { //checks if the mouse was within the bounds of the button when it was clicked
            b.OnClick(); //if it was, execute the button's onclick function
        }
    });
    for (let i = 0; i < pa_planets.length; i++) { //checks all of the planet displays
        for (let j = 0; j < pa_planets[0].ta_timePeriods.length; j++) { //checks all of the time period displays inm the planet
            if ((x > (i * planetOverviewWidth) + timePeriodBoardShift && x < ((i + 1) * planetOverviewWidth) + timePeriodBoardShift) && (y > (j * timePeriodOverviewHeight) + timePeriodBoardShift && y < ((j + 1) * timePeriodOverviewHeight) + timePeriodBoardShift)) { //checks if the click was within the display of that time period
                if (n_selectedPlanetIndex === i && n_selectedTimePeriodIndex === j) { //checks if the clicked on time period is already selected
                    //sets the selected indexes to the default none values if it is currently selected
                    n_selectedPlanetIndex = -1;
                    n_selectedTimePeriodIndex = -1;
                }
                else {
                    //sets the selected indexes to that time period
                    n_selectedPlanetIndex = i;
                    n_selectedTimePeriodIndex = j;
                }
            }
        }
    }
    DrawBoard();
};
canvas.addEventListener('mousedown', (e) => CheckForPressed(e)); //sets an event listener to check if the player clicked on a button for every time they click on the canvas
const DrawBoard = () => {
    context.fillStyle = "#03053c"; //sets the fill color to a dark blue
    context.fillRect(0, 0, canvas.width, canvas.height); //draws a dark blue square over the whole canvas
    ba_buttons.forEach((b) => b.Draw()); //draws all of the buttons to the screen
    for (let i = 0; i < numTimePeriods; i++) { //loops through all of the time period levels and draws a number on the side of the board
        context.fillStyle = "white"; //sets the fill color to a white
        context.fillRect(timePeriodBoardShift - boardNumberLabelWidth, timePeriodBoardShift + (timePeriodOverviewHeight * i), boardNumberLabelWidth, timePeriodOverviewHeight); //draws a white background where the number will go
        context.strokeStyle = "black"; //sets the stroke color to a black
        context.lineWidth = 3; //sets the width of the stroke line
        context.strokeRect(timePeriodBoardShift - boardNumberLabelWidth, timePeriodBoardShift + (timePeriodOverviewHeight * i), boardNumberLabelWidth, timePeriodOverviewHeight); //draws a black border around where the number will go
        context.font = planetLabelFont; //makes sure that the planet label font is set properly
        context.fillStyle = "black"; //sets the fill color to a black
        context.fillText(`${i + 1}`, timePeriodBoardShift - (boardNumberLabelWidth * 0.8), timePeriodBoardShift + ((timePeriodOverviewHeight * (i + 1)) - (timePeriodOverviewHeight * 0.4)));
    }
    for (let i = 0; i < pa_planets.length; i++) { //loops through all of the planets
        pa_planets[i].Draw(planetOverviewWidth * i, i); //runs their draw function
    }
};
const DebugPlanets = () => {
    pa_planets.forEach((p) => {
        console.log(`${p.s_name}: `);
        console.log(` Time Periods:`);
        for (let i = 0; i < p.ta_timePeriods.length; i++) {
            console.log(`  Age ${i + 1}:`);
            console.log(`   Level: ${p.ta_timePeriods[i].n_level}`);
            console.log(`   Modifier: ${p.ta_timePeriods[i].n_modifier}`);
            console.log(`   Effective Level: ${p.ta_timePeriods[i].n_level + p.ta_timePeriods[i].n_modifier}`);
            console.log(`   Resources: ${p.ta_timePeriods[i].n_resources}`);
            console.log(`   Number of Troops: ${p.ta_timePeriods[i].ta_troops.length}`);
            console.log(`   Number of Buildings: ${p.ta_timePeriods[i].ba_buildings.length}`);
        }
    });
};
const InitializeGame = () => {
    for (let i = 0; i < numPlanets; i++) {
        pa_planets.push(new Planet(`Planet ${i + 1}`));
    }
    //DebugPlanets() //temp: prints all of the planets to the console for debugging
    DrawBoard(); //draws the board when the page loads
};
InitializeGame(); //runs the initialize game function to start the game
//# sourceMappingURL=gameLogic.js.map