// using d3 for convenience
var main = d3.select("main");
var scrolly = main.select("#scrolly");
var figure = scrolly.select("figure");
var article = scrolly.select("article");
var step = article.selectAll(".step");

// initialize the scrollama
var scroller = scrollama();

function AutoScroller(y) {
    this.times = 0;
    this.moveInter = 0;
    this.backInter = 0;

    this.moveBack = function () {
        var self = this;
        clearInterval(this.moveInter);
        this.backInter = setInterval(function () {
            self.times -= 5;
            y.scrollTop(self.times);
            if (self.times == 0) {
                return self.startMove();
            }
        }, 1);
    };

    this.move = function () {
        var self = this;
        this.moveInter = setInterval(function () {
            self.times++;
            y.scrollTop(self.times);
            if (self.times == 1200) {
                d3.select("#arrow")
                    .style("transition", "3s")
                    .style("opacity", 1);
            }
        }, 10);
    };

    this.startMove = function () {
        this.times = 0;
        var self = this;
        if (this.backInter != null) {
            clearInterval(this.backInter);
        }
        window.setTimeout(function () {
            self.move();
        }, 2000);
    };
}

// generic window resize listener event
function handleResize() {
    // 1. update height of step elements
    var stepH = Math.floor(window.innerHeight * 0.75);
    step.style("height", stepH + "px");

    var figureHeight = window.innerHeight; /// 1.1;
    var figureMarginTop = (window.innerHeight - figureHeight) / 2;

    figure
        .style("height", figureHeight + "px")
        .style("top", figureMarginTop + "px");

    // 3. tell scrollama to update new element dimensions
    scroller.resize();
}

// scrollama event handlers
function handleStepEnter(response) {
    console.log("enter-step", response);
    // response = { element, direction, index }

    // add color to current step only
    step.classed("is-active", function (d, i) {
        response.element.style.transition = "500ms";
        response.element.style.opacity = 1;
        return i === response.index;
    });
    console.log("step-enter-response", response);
    // update graphic based on step
    switch (response.index) {
        case 0:
            d3.select("#arrow").style("transition", "1s").style("opacity", 0);
            figure.select("#heatmap1").style("opacity", 1);
            figure.select("#heatmap2").style("opacity", 0);
            break;
        case 3:
            figure.select("#heatmap1").style("opacity", 0);
            figure.select("#heatmap2").style("opacity", 1);
            figure.select("#filter").style("opacity", 0);
            break;
        case 4:
            figure.select("#heatmap2").style("opacity", 0);
            figure.select("#filter").style("opacity", 1);
            figure.select("#tableau1_demo_annotated").style("opacity", 0);
            break;
        case 5:
            figure.select("#filter").style("opacity", 0);
            figure.select("#tableau1_demo_annotated").style("opacity", 1);
            figure
                .select("#viz1596390609144")
                .style("opacity", 0)
                .style("z-index", 0)
                .style("position", "relative");;
            break;            
        case 6:
            figure.select("#tableau1_demo_annotated").style("opacity", 0);
            figure
                .select("#viz1596390609144")
                .style("opacity", 1)
                .style("z-index", 1)
                .style("position", "absolute");
            break;
        case 7:
            figure
                .select("#viz1596390609144")
                .style("opacity", 1)
                .style("z-index", 1)
                .style("position", "absolute");
            figure.select("#heatmap3").style("opacity", 0);
            break;            
        case 8:
            figure
                .select("#viz1596390609144")
                .style("opacity", 0)
                .style("z-index", 0)
                .style("position", "absolute");
            figure.select("#heatmap3").style("opacity", 1);                
            figure.select("#tableau2_toggle_demo").style("opacity", 0);
            break;
        case 9:
            figure.select("#heatmap3").style("opacity", 0);       
            figure.select("#tableau2_toggle_demo").style("opacity", 1);
            figure.select("#tableau2_select_demo").style("opacity", 0);
            break;
        case 10:
            figure.select("#tableau2_toggle_demo").style("opacity", 0);
            figure.select("#tableau2_select_demo").style("opacity", 1);
            figure
                .select("#viz1596437702819")
                .style("opacity", 0)
                .style("z-index", 0).style("position", "absolute");;
            break;
        case 11:
            figure.select("#tableau2_select_demo").style("opacity", 0);
            figure
                .select("#viz1596437702819")
                .style("opacity", 1)
                .style("z-index", 1);
            break;
        case 13:
            figure
                .select("#viz1596437702819")
                .style("opacity", 1)
                .style("z-index", 1);        
           figure.select("#heatmap4").style("opacity", 0);
            break;
        case 14:
            figure
                .select("#viz1596437702819")
                .style("opacity", 0)
                .style("z-index", 0)
                .style("position", "absolute");
            figure.select("#heatmap4").style("opacity", 1);
            figure
                .select("#viz1596584113569")
                .style("opacity", 0)
                .style("z-index", 0)
                .style("position", "relative");            
            break;
        case 15:
            figure.select("#heatmap4").style("opacity", 0);
            figure
                .select("#viz1596584113569")
                .style("opacity", 1)
                .style("z-index", 1)
                .style("position", "relative");
            break;                                
        default:
        // code block
    }
}

// scrollama event handlers
function handleStepExit(response) {
    console.log("exit-step", response);
    // response = { element, direction, index }
    if (response.direction === "up") {
        response.element.style.transition = "500ms";
        response.element.style.opacity = 0;
    }

    // add color to current step only
    step.classed("is-active", function (d, i) {
        return i === response.index;
    });

    // update graphic based on step
    ///igure.select("p").text(response.index + 1);
}

function setupStickyfill() {
    d3.selectAll(".sticky").each(function () {
        Stickyfill.add(this);
    });
}

function init() {
    setupStickyfill();

    // 1. force a resize on load to ensure proper dimensions are sent to scrollama
    handleResize();

    // 2. setup the scroller passing options
    //    this will also initialize trigger observations
    // 3. bind scrollama event handlers (this can be chained like below)
    scroller
        .setup({
            step: "#scrolly article .step",
            offset: 0.6,
        })
        .onStepEnter(handleStepEnter)
        .onStepExit(handleStepExit);

    // setup resize event
    window.addEventListener("resize", handleResize);
}

// kick things off
init();

jQuery(".screenshot").each(function () {
    y = jQuery(this);
    var autoscroller = new AutoScroller(y);
    window.setTimeout(function () {
        autoscroller.startMove();
    }, 2000);
});
