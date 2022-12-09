'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];




class Workout{
    date=new Date();
    id=(Date.now()+"").slice(-10);
    constructor(coords,distance,duration){
        this.coords=coords;//[lat,lng]
        this.distance=distance;//in km
        this.duration=duration;//in min
    }
}

class Running extends Workout{
    type="runing";
constructor(coords,distance,duration,cadence){
    super(coords,distance,duration);
    this.cadence=cadence;
    this.calcPace();
}
calcPace(){
    //min/km
    this.pace=this.duration/this.distance;
    return this.pace;
}
}

class Cycling extends Workout{
    type="cycling";
    constructor(coords,distance,duration,elevationGain){
        super(coords,distance,duration);
        this.elevationGain=elevationGain;
        this.calcSpeed();
    }
    calcSpeed(){
        //km/h
        this.speed=this.distance/(this.duration/60);
        return this.speed;
    }
}


/////////////////////////////////////////////
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App{
    #map;
    #mapEvent;
    #workouts=[]; 
    constructor(){
    this._getPosition();        
   form.addEventListener("submit",this._newWorkout.bind(this));

   inputType.addEventListener("change",this._toggleElavationField)
    }

    _getPosition(){
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),
        function(){
            alert("couldn't get your position");
        });
    }

    _loadMap(position){
            const{latitude}=position.coords;
            const{longitude}=position.coords;
            const coords=[latitude,longitude];
            
           this.#map = L.map('map').setView(coords, 13);
        
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo( this.#map);
            this.#map.on("click",this._showForm.bind(this))
    }

    _showForm(mapE){
        this.#mapEvent=mapE;
        form.classList.remove("hidden");
        inputDistance.focus();
    }

    _toggleElavationField(){
        inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
        inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    }

    _newWorkout(e){
    const validInput=(...inputs)=>inputs.every(inp=>Number.isFinite(inp));
    const allpositive=(...inputs)=>inputs.every(inp=>inp>0);
    e.preventDefault();

    //get data from form
    const type=inputType.value;
    const distance=+inputDistance.value;
    const duration=+inputDuration.value;
    const {lat,lng}=this.#mapEvent.latlng;
    let workout;


    //if workout  running,creat running object
    if(type==="running"){
    const cadence=+inputCadence.value;

    //check validation of data
    if(!validInput(distance,duration,cadence)||!allpositive(distance,duration,cadence))
    return alert("Inputs have to be positive number");
     workout=new Running([lat,lng],distance,duration,cadence);
   
    }

    //if workout  cycling,creat cycling object
    if(type==="cycling"){
    const elevation=+inputElevation.value;

    //check validation of data
    if(!validInput(distance,duration,elevation)||!allpositive(distance,duration))
    return alert("Inputs have to be positive number");
    workout=new Cycling([lat,lng],distance,duration,elevation);
     }

    //add new object to workout 
    this.#workouts.push(workout);

    //render workout on map as marker
   this.renderWorkout(workout)
    //render workout on list

    //hide and clear input fields
    inputCadence.value=inputDistance.value=inputDuration.value=inputElevation.value="";
    }
    renderWorkout(workout){
        L.marker(workout.coords).addTo(this.#map)
        .bindPopup
        (L.popup({
            maxWidth:250,
            minWidth:100,
            autoClose:false,
            closeOnClick:false,
            className:`${workout.type}-popup`
        })
        )
        .setPopupContent("workout")
        .openPopup();
    }
}
const app=new App();

