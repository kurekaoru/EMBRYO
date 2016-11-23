function toBinString (arr) {
    var uarr = new Uint8Array(arr);
    var strings = [], chunksize = 0xffff;
    // There is a maximum stack size. We cannot call String.fromCharCode with as many arguments as we want
    for (var i=0; i*chunksize < uarr.length; i++){
        strings.push(String.fromCharCode.apply(null, uarr.subarray(i*chunksize, (i+1)*chunksize)));
    }
    return strings.join('');
}

var Molvwr;
(function (Molvwr) {
    var BabylonContext = (function () {
        function BabylonContext(canvas) {
            var _this = this;
            this.canvas = canvas;
            this.engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true });
            this.engine.runRenderLoop(function () {
                if (_this.scene)
                    _this.scene.render();
            });
            this.bindedResize = this.resize.bind(this);
            window.addEventListener("resize", this.bindedResize);
        }
        BabylonContext.prototype.resize = function () {
            this.engine.resize();
        };
        BabylonContext.prototype.exportScreenshot = function () {
            return this.canvas.toDataURL("image/png");
        };
        BabylonContext.prototype.dispose = function () {
            this.engine.dispose();
            window.removeEventListener("resize", this.bindedResize);
        };
        BabylonContext.prototype.sphereMaterial = function (mesh, atomMat, useEffects) {
            if (this.viewmode) {
                this.viewmode.sphereMaterial(this, mesh, atomMat, useEffects);
            }
        };
        BabylonContext.prototype.cylinderMaterial = function (mesh, atomMat, useEffects) {
            if (this.viewmode) {
                this.viewmode.cylinderMaterial(this, mesh, atomMat, useEffects);
            }
        };
        BabylonContext.prototype.createScene = function () {
            if (this.scene)
                this.scene.dispose();
            console.log("create babylon scene");
            var scene = new BABYLON.Scene(this.engine);
            this.scene = scene;
            if (this.viewmode) {
                this.viewmode.createScene(this);
            }
        };
        return BabylonContext;
    })();
    Molvwr.BabylonContext = BabylonContext;
})(Molvwr || (Molvwr = {}));

var Molvwr;
(function (Molvwr) {
    var Config;
    (function (Config) {
        function defaultConfig() {
            return {
                allowLOD: false,
                renderers: ['Sphere'],
                atomScaleFactor: 3,
                cylinderScale: 0.6,
                sphereSegments: 16
            };
        }
        Config.defaultConfig = defaultConfig;
        function spheres() {
            return {
                allowLOD: true,
                renderers: ['Sphere'],
                atomScaleFactor: 3,
                cylinderScale: 0.6,
                sphereSegments: 16,
                sphereLOD: [{ depth: 0, segments: 32, effects: true }, { depth: 5, segments: 24, effects: true }, { depth: 10, segments: 16, effects: true }, { depth: 20, segments: 12, effects: true }, { depth: 40, segments: 6, effects: true }, { depth: 60, segments: 6 }, { depth: 80, segments: 4 }]
            };
        }
        Config.spheres = spheres;
        function sticks() {
            return {
                allowLOD: true,
                renderers: ['Sticks'],
                atomScaleFactor: 1.3,
                cylinderScale: 1.4,
                sphereSegments: 16,
                cylinderSegments: 16,
                cylinderLOD: [{ depth: 0, segments: 64, effects: true }, { depth: 10, segments: 32, effects: true }, { depth: 20, segments: 24, effects: true }, { depth: 40, segments: 16, effects: true }, { depth: 60, segments: 12 }, { depth: 80, segments: 8 }],
            };
        }
        Config.sticks = sticks;
        function ballsAndSticks() {
            return {
                allowLOD: true,
                renderers: ['BondsCylinder', 'Sphere'],
                atomScaleFactor: 1.3,
                cylinderScale: 0.6,
                sphereSegments: 16,
                cylinderSegments: 8,
                cylinderLOD: [{ depth: 0, segments: 64, effects: true }, { depth: 5, segments: 32, effects: true }, { depth: 20, segments: 24, effects: true }, { depth: 60, segments: 12 }],
                sphereLOD: [{ depth: 0, segments: 64, effects: true }, { depth: 5, segments: 32, effects: true }, { depth: 10, segments: 24, effects: true }, { depth: 20, segments: 16, effects: true }, { depth: 40, segments: 12, effects: true }, { depth: 60, segments: 6 }, { depth: 80, segments: 4 }]
            };
        }
        Config.ballsAndSticks = ballsAndSticks;
    })(Config = Molvwr.Config || (Molvwr.Config = {}));
})(Molvwr || (Molvwr = {}));

var __global = this;
var Molvwr;
(function (Molvwr) {
    function process() {
        if (!__global.BABYLON) {
            console.error("Babylon.js is not available, please add a reference to Babylon.js script");
            return;
        }
        var elements;
        if (arguments[0]) {
            if (arguments[0].length) {
                elements = arguments[0];
            }
            else {
                elements = [arguments[0]];
            }
        }
        else {
            elements = document.querySelectorAll("*[data-molvwr]");
        }
        for (var i = 0, l = elements.length; i < l; i++) {
            var e = elements[i];
            if (e && e.style) {
                if (e.molvwr) {
                    e.molvwr.dispose();
                }
                //------------------------------------------------------------------------------------------------------------------This is where molecule selector is defined
                var moleculeUrl = e.getAttribute("data-molvwr");
                var format = e.getAttribute("data-molvwr-format");
                var view = e.getAttribute("data-molvwr-view");
                if (!format) {
                    format = Viewer.getMoleculeFileFormat(moleculeUrl);
                }
                if (!moleculeUrl) {
                    console.error("please specify a molecule url by adding a data-molvwr attribute");
                    return;
                }
                if (!format) {
                    console.error("molecule file format not found or not specified for " + moleculeUrl);
                    return;
                }
                var options = null;
                if (view == "spheres") {
                    options = Molvwr.Config.spheres();
                }
                else if (view == "ballsandsticks") {
                    options = Molvwr.Config.ballsAndSticks();
                }
                else if (view == "sticks") {
                    options = Molvwr.Config.sticks();
                }
                if (moleculeUrl && format) {
                    var viewer = new Viewer(e, options);
                    viewer.loadContentFromUrl(moleculeUrl, format);
                }
            }
        }
    }
    Molvwr.process = process;
    var Viewer = (function () {
        function Viewer(element, config, viewmode) {
            if (!__global.BABYLON) {
                throw new Error("Babylon.js is not available, please add a reference to Babylon.js script");
            }
            if (!element)
                throw new Error("you must provide an element to host the viewer");
            this.config = config || Molvwr.Config.defaultConfig();
            this.element = element;
            this.element.molvwr = this;
            this.canvas = document.createElement("CANVAS");
            this.canvas.setAttribute("touch-action", "manipulation");
            this.canvas.style.width = "100%";
            this.canvas.style.height = "100%";
            this.element.appendChild(this.canvas);
            this.context = new Molvwr.BabylonContext(this.canvas);
            this.viewmode = viewmode;
            if (!this.viewmode) {
                this.viewmode = new Molvwr.ViewModes.Standard();
            }
        }
        Viewer.prototype.dispose = function () {
            this.context.dispose();
            this.context = null;
            this.element = null;
            this.canvas = null;
            this.element.innerHTML = "";
        };
        Viewer.prototype._loadContentFromString = function (content, contentFormat, dataReadyCallback) {
            var _this = this;
            return new Molvwr.Utils.Promise(function (complete, error) {
                var parser = Molvwr.Parser[contentFormat];
                if (parser) {
                    console.time("parsing " + contentFormat);
                    var molecule = parser.parse(content);
                    console.timeEnd("parsing " + contentFormat);
                    if (molecule) {
                        _this._postProcessMolecule(molecule).then(function () {
                            dataReadyCallback(molecule);
                            return _this._renderMolecule(molecule);
                        }).then(function () {
                            return molecule;
                        }).then(complete, error);
                    }
                    else {
                        console.warn("no molecule from parser " + contentFormat);
                        complete();
                    }
                }
                else {
                    console.warn("no parser for " + contentFormat);
                    complete();
                }
            });
        };
        Viewer.prototype._renderMolecule = function (molecule) {
            var _this = this;
            this.molecule = molecule;
            this._createContext();
            return new Molvwr.Utils.Promise(function (complete, error) {
                console.time("rendering...");
                if (_this.config.renderers) {
                    var completedCount = 0;
                    var nbrenderers = _this.config.renderers.length;
                    var p = [];
                    _this.config.renderers.forEach(function (rendererName) {
                        var rendererClass = Molvwr.Renderer[rendererName];
                        if (rendererClass) {
                            var renderer = new rendererClass(_this, _this.context, _this.config);
                            p.push(renderer.render(_this.molecule));
                        }
                    });
                    Molvwr.Utils.Promise.all(p).then(function () {
                        console.timeEnd("rendering...");
                    }).then(complete, error);
                }
                else {
                    complete(molecule);
                }
            });
        };
        Viewer.prototype.setOptions = function (options, completedcallback) {
            this.config = options;
            this.refresh(completedcallback);
        };
        Viewer.prototype.setViewMode = function (viewmode, completedcallback) {
            this.viewmode = viewmode;
            if (!this.viewmode) {
                this.viewmode = new Molvwr.ViewModes.Standard();
            }
            this.refresh(completedcallback);
        };
        Viewer.prototype.refresh = function (completedcallback) {
            if (this.molecule) {
                this._renderMolecule(this.molecule).then(completedcallback, completedcallback);
            }
            else {
                if (completedcallback)
                    completedcallback();
            }
        };
        Viewer.prototype._createContext = function () {
            if (this.context)
                this.context.dispose();
            this.context = new Molvwr.BabylonContext(this.canvas);
            this.context.viewmode = this.viewmode;
            this.context.createScene();
        };
        Viewer.prototype.exportScreenshot = function () {
            return this.context.exportScreenshot();
        };
        Viewer.endsWith = function (str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        };
        ;
        // Find Molecule file format
        Viewer.getMoleculeFileFormat = function (filename) {
            if (Viewer.endsWith(filename, ".pdb"))
                return "pdb";
            if (Viewer.endsWith(filename, ".mol") || Viewer.endsWith(filename, ".sdf"))
                return "mol";
            if (Viewer.endsWith(filename, ".xyz"))
                return "xyz";
            return null;
        };
        Viewer.prototype.loadContentFromString = function (content, contentFormat, datareadycallback, completedcallback) {
            this._createContext();
            this._loadContentFromString(content, contentFormat, datareadycallback).then(completedcallback, completedcallback);
        };
        Viewer.prototype.loadContentFromUrl = function (url, contentFormat, datareadycallback, completedcallback) {
            var _this = this;
            // First determine which portocool to use
            if (!contentFormat) {
                contentFormat = Viewer.getMoleculeFileFormat(url);
            }
            if (!contentFormat) {
                console.error("molecule file format not found or not specified");
            }
            this._createContext();
            try {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        if (xhr.status == 200) {
                            _this._loadContentFromString(xhr.responseText, contentFormat, datareadycallback).then(completedcallback, completedcallback);
                        }
                        else {
                            console.warn("cannot get content from " + url + " " + xhr.status + " " + xhr.statusText);
                            completedcallback();
                        }
                    }
                };
                xhr.open("GET", url, true);
                xhr.send(null);
            }
            catch (e) {
                console.error(e);
                completedcallback();
            }
            ///////////////////////////////////////////
            // Load EMBRYO DATABASE 
            try {
                console.log("Quoting cell database...");
                var xhr2 = new XMLHttpRequest();
                xhr2.onreadystatechange = function () {
                        xhr2.open('GET', 'EMBRYO.db', true);
                        xhr2.responseType = 'arraybuffer';
                        console.log("LOADING DATABASE EMBRYO.db.....");
                        console.log(this.response);
                        var uInt8Array = new Uint8Array(xhr2.response);
                        console.log("Response OK");
                        var db = new SQL.Database(uInt8Array);
                        var contents = db.exec("SELECT * FROM CELLCOL limit 10");
                        console.log("GOT DATA...");
                    //console.log(contents);
                    //xhr2.onreadystatechange = function () {
                    //    console.log("Quoting cell database...");
                        //if (xhr.readyState == 4) {
                        //    if (xhr.status == 200) {
                        //        _this._loadContentFromString(xhr.responseText, contentFormat, datareadycallback).then(completedcallback, completedcallback);
                        //    }
                        //    else {
                        //        console.warn("cannot get content from " + url + " " + xhr.status + " " + xhr.statusText);
                        //        completedcallback();
                    //}
                    //xhr.open("GET", url, true);
                    //xhr.send(null);
                    console.log("Quoting complete");
                };
            } catch (e) {
                console.error(e);
                completedcallback();
            }
            ///////////////////////////////////////////
        };
     ////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'EMBRYO.db', true);
        xhr.responseType = 'arraybuffer';
        xhr.onreadystatechange = function(e) {
            console.log("Quoting cell database...");
            var uInt8Array = new Uint8Array(this.response);
            var db = new SQL.Database(uInt8Array);
            var contents = db.exec("SELECT * FROM CELLCOL limit 10");
            console.log(contents);
            //contents is now [{columns:['col1','col2',...], values:[[first row], [second row], ...]}]
            //console.log(toBinString(db.export()));
            for (var X in contents){
                console.log(X);
            };
        xhr.send();
        };
    }   catch (e) {
        console.error(e);
        completedcallback();
    };
    */
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
        Viewer.prototype._postProcessMolecule = function (molecule) {
            var _this = this;
            console.time("post process");
            molecule.kinds = molecule.kinds || {};
            molecule.bondkinds = molecule.bondkinds || {};
            molecule.batchSize = Math.min(120, (molecule.atoms.length / 4) >> 0);
            molecule.batchSize = Math.max(40, molecule.batchSize);
            molecule.bonds = []
            return this._center(molecule).then(function () {
                return _this._calculateAtomsBondsAsync(molecule);
            }).then(function () {
                console.timeEnd("post process");
            });
        };
        ////////////////////////////////////////////////////////////////////
        // Calculates the bonds based on distance
        Viewer.prototype._calculateAtomsBondsAsync = function (molecule) {
            console.time("check bounds");
            //var bonds = [];
            var nbatoms = molecule.atoms.length;
            //console.log(molecule.atoms[0]);
            return Molvwr.Utils.runBatch(0, 300, molecule.atoms, function (atom, batchindex, index) {
                //console.log("check " + atom.kind.symbol + " " + index + " " + bonds.length);
                if (!molecule.kinds[atom.kind.symbol]) {
                    molecule.kinds[atom.kind.symbol] = { kind: atom.kind, count: 1 };
                }
                else {
                    molecule.kinds[atom.kind.symbol].count++;
                }
                // Check bond partners for each atom
                for (var i = index + 1; i < nbatoms; i++) {
                    var siblingAtom = molecule.atoms[i];
                    var l = new BABYLON.Vector3(atom.x, atom.y, atom.z);
                    var m = new BABYLON.Vector3(siblingAtom.x, siblingAtom.y, siblingAtom.z);
                    var d = BABYLON.Vector3.Distance(l, m);
                    if (d < 1.3 * (atom.kind.radius + siblingAtom.kind.radius)) {
                        if (!molecule.bondkinds[atom.kind.symbol + "#" + siblingAtom.kind.symbol]) {
                            molecule.bondkinds[atom.kind.symbol + "#" + siblingAtom.kind.symbol] = { d: d, key: atom.kind.symbol + "#" + siblingAtom.kind.symbol, kindA: atom.kind, kindB: siblingAtom.kind, count: 1 };
                        }
                        else {
                            molecule.bondkinds[atom.kind.symbol + "#" + siblingAtom.kind.symbol].count++;
                        }
                        /*
                        bonds.push({
                            d: d,
                            atomA: atom,
                            atomB: siblingAtom,
                            cutoff: d / (atom.kind.radius + siblingAtom.kind.radius)
                        });*/
                    }
                }
            }, "checkbounds").then(function () {
                //molecule.bonds = bonds;
                console.timeEnd("Skipped calculating bounds");
                //console.log("found " + bonds.length + " bonds");
            });
        };
        Viewer.prototype._getCentroid = function (molecule) {
            var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
            molecule.atoms.forEach(function (atom) {
                if (atom.x > maxX)
                    maxX = atom.x;
                if (atom.x < minX)
                    minX = atom.x;
                if (atom.y > maxY)
                    maxY = atom.y;
                if (atom.y < minY)
                    minY = atom.y;
                if (atom.z > maxZ)
                    maxZ = atom.z;
                if (atom.z < minZ)
                    minZ = atom.z;
            });
            return {
                x: (minX + maxX) / 2,
                y: (minY + maxY) / 2,
                z: (minZ + maxZ) / 2,
            };
        };
        Viewer.prototype._center = function (molecule) {
            console.time("recenter atoms");
            var shift = this._getCentroid(molecule);
            molecule.atoms.forEach(function (atom) {
                atom.x -= shift.x;
                atom.y -= shift.y;
                atom.z -= shift.z;
            });
            console.timeEnd("recenter atoms");
            return Molvwr.Utils.Promise.resolve();
        };
        return Viewer;
    })();
    Molvwr.Viewer = Viewer;
})(Molvwr || (Molvwr = {}));

var Molvwr;
(function (Molvwr) {
    var Elements;
    (function (Elements) {
        Elements.elements = [
        { 'symbol': 'AB', 'name': 'AB', 'mass': 10.0, 'radius':0.8, 'color': [0.818,0.164,0.100], 'number':0},
        { 'symbol': 'ABa', 'name': 'ABa', 'mass': 10.0, 'radius':0.8, 'color': [0.958,0.820,0.096], 'number':1},
        { 'symbol': 'ABal', 'name': 'ABal', 'mass': 10.0, 'radius':0.8, 'color': [0.512,0.061,0.211], 'number':2},
        { 'symbol': 'ABala', 'name': 'ABala', 'mass': 10.0, 'radius':0.8, 'color': [0.367,0.149,0.526], 'number':3},
        { 'symbol': 'ABalaa', 'name': 'ABalaa', 'mass': 10.0, 'radius':0.8, 'color': [0.871,0.961,0.886], 'number':4},
        { 'symbol': 'ABalaaa', 'name': 'ABalaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.209,0.373,0.463], 'number':5},
        { 'symbol': 'ABalaaaa', 'name': 'ABalaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.185,0.198,0.960], 'number':6},
        { 'symbol': 'ABalaaaal', 'name': 'ABalaaaal', 'mass': 10.0, 'radius':0.8, 'color': [0.901,0.741,0.104], 'number':7},
        { 'symbol': 'ABalaaaala', 'name': 'ABalaaaala', 'mass': 10.0, 'radius':0.8, 'color': [0.083,0.611,0.159], 'number':8},
        { 'symbol': 'ABalaaaalp', 'name': 'ABalaaaalp', 'mass': 10.0, 'radius':0.8, 'color': [0.000,0.032,0.203], 'number':9},
        { 'symbol': 'ABalaaaar', 'name': 'ABalaaaar', 'mass': 10.0, 'radius':0.8, 'color': [0.779,0.537,0.951], 'number':10},
        { 'symbol': 'ABalaaaarl', 'name': 'ABalaaaarl', 'mass': 10.0, 'radius':0.8, 'color': [0.234,0.708,0.786], 'number':11},
        { 'symbol': 'ABalaaaarr', 'name': 'ABalaaaarr', 'mass': 10.0, 'radius':0.8, 'color': [0.899,0.198,0.880], 'number':12},
        { 'symbol': 'ABalaaap', 'name': 'ABalaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.058,0.591,0.418], 'number':13},
        { 'symbol': 'ABalaaapa', 'name': 'ABalaaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.965,0.493,0.283], 'number':14},
        { 'symbol': 'ABalaaapal', 'name': 'ABalaaapal', 'mass': 10.0, 'radius':0.8, 'color': [0.488,0.632,0.525], 'number':15},
        { 'symbol': 'ABalaaapar', 'name': 'ABalaaapar', 'mass': 10.0, 'radius':0.8, 'color': [0.362,0.369,0.011], 'number':16},
        { 'symbol': 'ABalaaapp', 'name': 'ABalaaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.870,0.364,0.104], 'number':17},
        { 'symbol': 'ABalaaappl', 'name': 'ABalaaappl', 'mass': 10.0, 'radius':0.8, 'color': [0.982,0.194,0.800], 'number':18},
        { 'symbol': 'ABalaaappr', 'name': 'ABalaaappr', 'mass': 10.0, 'radius':0.8, 'color': [0.907,0.164,0.931], 'number':19},
        { 'symbol': 'ABalaap', 'name': 'ABalaap', 'mass': 10.0, 'radius':0.8, 'color': [0.824,0.968,0.852], 'number':20},
        { 'symbol': 'ABalaapa', 'name': 'ABalaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.765,0.790,0.346], 'number':21},
        { 'symbol': 'ABalaapaa', 'name': 'ABalaapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.028,0.896,0.159], 'number':22},
        { 'symbol': 'ABalaapaaa', 'name': 'ABalaapaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.951,0.494,0.022], 'number':23},
        { 'symbol': 'ABalaapaap', 'name': 'ABalaapaap', 'mass': 10.0, 'radius':0.8, 'color': [0.873,0.674,0.481], 'number':24},
        { 'symbol': 'ABalaapap', 'name': 'ABalaapap', 'mass': 10.0, 'radius':0.8, 'color': [0.435,0.302,0.752], 'number':25},
        { 'symbol': 'ABalaapapa', 'name': 'ABalaapapa', 'mass': 10.0, 'radius':0.8, 'color': [0.123,0.106,0.486], 'number':26},
        { 'symbol': 'ABalaapapp', 'name': 'ABalaapapp', 'mass': 10.0, 'radius':0.8, 'color': [0.584,0.155,0.654], 'number':27},
        { 'symbol': 'ABalaapp', 'name': 'ABalaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.049,0.798,0.650], 'number':28},
        { 'symbol': 'ABalaappa', 'name': 'ABalaappa', 'mass': 10.0, 'radius':0.8, 'color': [0.200,0.618,0.289], 'number':29},
        { 'symbol': 'ABalaappaa', 'name': 'ABalaappaa', 'mass': 10.0, 'radius':0.8, 'color': [0.903,0.024,0.652], 'number':30},
        { 'symbol': 'ABalaappap', 'name': 'ABalaappap', 'mass': 10.0, 'radius':0.8, 'color': [0.800,0.359,0.017], 'number':31},
        { 'symbol': 'ABalaappp', 'name': 'ABalaappp', 'mass': 10.0, 'radius':0.8, 'color': [0.335,0.466,0.241], 'number':32},
        { 'symbol': 'ABalaapppa', 'name': 'ABalaapppa', 'mass': 10.0, 'radius':0.8, 'color': [0.253,0.158,0.448], 'number':33},
        { 'symbol': 'ABalaapppp', 'name': 'ABalaapppp', 'mass': 10.0, 'radius':0.8, 'color': [0.346,0.450,0.283], 'number':34},
        { 'symbol': 'ABalap', 'name': 'ABalap', 'mass': 10.0, 'radius':0.8, 'color': [0.697,0.619,0.584], 'number':35},
        { 'symbol': 'ABalapa', 'name': 'ABalapa', 'mass': 10.0, 'radius':0.8, 'color': [0.623,0.881,0.983], 'number':36},
        { 'symbol': 'ABalapaa', 'name': 'ABalapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.368,0.540,0.289], 'number':37},
        { 'symbol': 'ABalapaaa', 'name': 'ABalapaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.104,0.038,0.559], 'number':38},
        { 'symbol': 'ABalapaaaa', 'name': 'ABalapaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.609,0.291,0.814], 'number':39},
        { 'symbol': 'ABalapaaap', 'name': 'ABalapaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.688,0.152,0.741], 'number':40},
        { 'symbol': 'ABalapaap', 'name': 'ABalapaap', 'mass': 10.0, 'radius':0.8, 'color': [0.139,0.482,0.074], 'number':41},
        { 'symbol': 'ABalapaapa', 'name': 'ABalapaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.094,0.118,0.438], 'number':42},
        { 'symbol': 'ABalapaapp', 'name': 'ABalapaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.318,0.863,0.194], 'number':43},
        { 'symbol': 'ABalapap', 'name': 'ABalapap', 'mass': 10.0, 'radius':0.8, 'color': [0.690,0.809,0.425], 'number':44},
        { 'symbol': 'ABalapapa', 'name': 'ABalapapa', 'mass': 10.0, 'radius':0.8, 'color': [0.458,0.754,0.610], 'number':45},
        { 'symbol': 'ABalapapaa', 'name': 'ABalapapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.808,0.256,0.016], 'number':46},
        { 'symbol': 'ABalapapap', 'name': 'ABalapapap', 'mass': 10.0, 'radius':0.8, 'color': [0.703,0.745,0.689], 'number':47},
        { 'symbol': 'ABalapapp', 'name': 'ABalapapp', 'mass': 10.0, 'radius':0.8, 'color': [0.383,0.388,0.460], 'number':48},
        { 'symbol': 'ABalapappa', 'name': 'ABalapappa', 'mass': 10.0, 'radius':0.8, 'color': [0.671,0.714,0.452], 'number':49},
        { 'symbol': 'ABalapappp', 'name': 'ABalapappp', 'mass': 10.0, 'radius':0.8, 'color': [0.053,0.620,0.197], 'number':50},
        { 'symbol': 'ABalapp', 'name': 'ABalapp', 'mass': 10.0, 'radius':0.8, 'color': [0.463,0.284,0.236], 'number':51},
        { 'symbol': 'ABalappa', 'name': 'ABalappa', 'mass': 10.0, 'radius':0.8, 'color': [0.443,0.564,0.716], 'number':52},
        { 'symbol': 'ABalappaa', 'name': 'ABalappaa', 'mass': 10.0, 'radius':0.8, 'color': [0.936,0.589,0.263], 'number':53},
        { 'symbol': 'ABalappap', 'name': 'ABalappap', 'mass': 10.0, 'radius':0.8, 'color': [0.809,0.346,0.597], 'number':54},
        { 'symbol': 'ABalappapa', 'name': 'ABalappapa', 'mass': 10.0, 'radius':0.8, 'color': [0.774,0.156,0.499], 'number':55},
        { 'symbol': 'ABalappapp', 'name': 'ABalappapp', 'mass': 10.0, 'radius':0.8, 'color': [0.191,0.017,0.462], 'number':56},
        { 'symbol': 'ABalappp', 'name': 'ABalappp', 'mass': 10.0, 'radius':0.8, 'color': [0.833,0.032,0.479], 'number':57},
        { 'symbol': 'ABalapppa', 'name': 'ABalapppa', 'mass': 10.0, 'radius':0.8, 'color': [0.917,0.937,0.001], 'number':58},
        { 'symbol': 'ABalapppaa', 'name': 'ABalapppaa', 'mass': 10.0, 'radius':0.8, 'color': [0.079,0.195,0.213], 'number':59},
        { 'symbol': 'ABalapppap', 'name': 'ABalapppap', 'mass': 10.0, 'radius':0.8, 'color': [0.541,0.365,0.651], 'number':60},
        { 'symbol': 'ABalapppp', 'name': 'ABalapppp', 'mass': 10.0, 'radius':0.8, 'color': [0.809,0.167,0.677], 'number':61},
        { 'symbol': 'ABalappppa', 'name': 'ABalappppa', 'mass': 10.0, 'radius':0.8, 'color': [0.156,0.916,0.946], 'number':62},
        { 'symbol': 'ABalappppp', 'name': 'ABalappppp', 'mass': 10.0, 'radius':0.8, 'color': [0.827,0.067,0.091], 'number':63},
        { 'symbol': 'ABalp', 'name': 'ABalp', 'mass': 10.0, 'radius':0.8, 'color': [0.513,0.140,0.223], 'number':64},
        { 'symbol': 'ABalpa', 'name': 'ABalpa', 'mass': 10.0, 'radius':0.8, 'color': [0.123,0.979,0.674], 'number':65},
        { 'symbol': 'ABalpaa', 'name': 'ABalpaa', 'mass': 10.0, 'radius':0.8, 'color': [0.547,0.511,0.016], 'number':66},
        { 'symbol': 'ABalpaaa', 'name': 'ABalpaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.754,0.306,0.576], 'number':67},
        { 'symbol': 'ABalpaaaa', 'name': 'ABalpaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.563,0.964,0.378], 'number':68},
        { 'symbol': 'ABalpaaaaa', 'name': 'ABalpaaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.856,0.890,0.018], 'number':69},
        { 'symbol': 'ABalpaaaap', 'name': 'ABalpaaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.710,0.083,0.778], 'number':70},
        { 'symbol': 'ABalpaaap', 'name': 'ABalpaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.013,0.261,0.202], 'number':71},
        { 'symbol': 'ABalpaaapa', 'name': 'ABalpaaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.186,0.676,0.512], 'number':72},
        { 'symbol': 'ABalpaaapp', 'name': 'ABalpaaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.009,0.425,0.379], 'number':73},
        { 'symbol': 'ABalpaap', 'name': 'ABalpaap', 'mass': 10.0, 'radius':0.8, 'color': [0.179,0.680,0.714], 'number':74},
        { 'symbol': 'ABalpaapa', 'name': 'ABalpaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.499,0.067,0.907], 'number':75},
        { 'symbol': 'ABalpaapaa', 'name': 'ABalpaapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.105,0.701,0.270], 'number':76},
        { 'symbol': 'ABalpaapap', 'name': 'ABalpaapap', 'mass': 10.0, 'radius':0.8, 'color': [0.325,0.167,0.612], 'number':77},
        { 'symbol': 'ABalpaapp', 'name': 'ABalpaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.095,0.469,0.950], 'number':78},
        { 'symbol': 'ABalpaappa', 'name': 'ABalpaappa', 'mass': 10.0, 'radius':0.8, 'color': [0.898,0.466,0.138], 'number':79},
        { 'symbol': 'ABalpaappp', 'name': 'ABalpaappp', 'mass': 10.0, 'radius':0.8, 'color': [0.213,0.463,0.029], 'number':80},
        { 'symbol': 'ABalpap', 'name': 'ABalpap', 'mass': 10.0, 'radius':0.8, 'color': [0.824,0.982,0.405], 'number':81},
        { 'symbol': 'ABalpapa', 'name': 'ABalpapa', 'mass': 10.0, 'radius':0.8, 'color': [0.432,0.749,0.154], 'number':82},
        { 'symbol': 'ABalpapaa', 'name': 'ABalpapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.688,0.865,0.392], 'number':83},
        { 'symbol': 'ABalpapaaa', 'name': 'ABalpapaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.424,0.469,0.682], 'number':84},
        { 'symbol': 'ABalpapaap', 'name': 'ABalpapaap', 'mass': 10.0, 'radius':0.8, 'color': [0.621,0.507,0.665], 'number':85},
        { 'symbol': 'ABalpapap', 'name': 'ABalpapap', 'mass': 10.0, 'radius':0.8, 'color': [0.275,0.446,0.067], 'number':86},
        { 'symbol': 'ABalpapapa', 'name': 'ABalpapapa', 'mass': 10.0, 'radius':0.8, 'color': [0.209,0.572,0.334], 'number':87},
        { 'symbol': 'ABalpapapp', 'name': 'ABalpapapp', 'mass': 10.0, 'radius':0.8, 'color': [0.212,0.570,0.661], 'number':88},
        { 'symbol': 'ABalpapp', 'name': 'ABalpapp', 'mass': 10.0, 'radius':0.8, 'color': [0.990,0.253,0.116], 'number':89},
        { 'symbol': 'ABalpappa', 'name': 'ABalpappa', 'mass': 10.0, 'radius':0.8, 'color': [0.252,0.001,0.876], 'number':90},
        { 'symbol': 'ABalpappaa', 'name': 'ABalpappaa', 'mass': 10.0, 'radius':0.8, 'color': [0.289,0.186,0.289], 'number':91},
        { 'symbol': 'ABalpappap', 'name': 'ABalpappap', 'mass': 10.0, 'radius':0.8, 'color': [0.194,0.078,0.535], 'number':92},
        { 'symbol': 'ABalpappp', 'name': 'ABalpappp', 'mass': 10.0, 'radius':0.8, 'color': [0.154,0.360,0.074], 'number':93},
        { 'symbol': 'ABalpapppa', 'name': 'ABalpapppa', 'mass': 10.0, 'radius':0.8, 'color': [0.920,0.006,0.423], 'number':94},
        { 'symbol': 'ABalpapppp', 'name': 'ABalpapppp', 'mass': 10.0, 'radius':0.8, 'color': [0.592,0.273,0.428], 'number':95},
        { 'symbol': 'ABalpp', 'name': 'ABalpp', 'mass': 10.0, 'radius':0.8, 'color': [0.578,0.787,0.895], 'number':96},
        { 'symbol': 'ABalppa', 'name': 'ABalppa', 'mass': 10.0, 'radius':0.8, 'color': [0.969,0.393,0.538], 'number':97},
        { 'symbol': 'ABalppaa', 'name': 'ABalppaa', 'mass': 10.0, 'radius':0.8, 'color': [0.505,0.417,0.438], 'number':98},
        { 'symbol': 'ABalppaaa', 'name': 'ABalppaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.973,0.507,0.859], 'number':99},
        { 'symbol': 'ABalppaaaa', 'name': 'ABalppaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.079,0.541,0.356], 'number':100},
        { 'symbol': 'ABalppaaap', 'name': 'ABalppaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.785,0.921,0.489], 'number':101},
        { 'symbol': 'ABalppaap', 'name': 'ABalppaap', 'mass': 10.0, 'radius':0.8, 'color': [0.808,0.427,0.078], 'number':102},
        { 'symbol': 'ABalppaapa', 'name': 'ABalppaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.779,0.214,0.040], 'number':103},
        { 'symbol': 'ABalppaapp', 'name': 'ABalppaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.612,0.074,0.933], 'number':104},
        { 'symbol': 'ABalppap', 'name': 'ABalppap', 'mass': 10.0, 'radius':0.8, 'color': [0.943,0.938,0.282], 'number':105},
        { 'symbol': 'ABalppapa', 'name': 'ABalppapa', 'mass': 10.0, 'radius':0.8, 'color': [0.403,0.757,0.341], 'number':106},
        { 'symbol': 'ABalppapaa', 'name': 'ABalppapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.551,0.467,0.358], 'number':107},
        { 'symbol': 'ABalppapap', 'name': 'ABalppapap', 'mass': 10.0, 'radius':0.8, 'color': [0.226,0.466,0.601], 'number':108},
        { 'symbol': 'ABalppapp', 'name': 'ABalppapp', 'mass': 10.0, 'radius':0.8, 'color': [0.373,0.122,0.321], 'number':109},
        { 'symbol': 'ABalppappa', 'name': 'ABalppappa', 'mass': 10.0, 'radius':0.8, 'color': [0.723,0.274,0.399], 'number':110},
        { 'symbol': 'ABalppappp', 'name': 'ABalppappp', 'mass': 10.0, 'radius':0.8, 'color': [0.464,0.443,0.245], 'number':111},
        { 'symbol': 'ABalppp', 'name': 'ABalppp', 'mass': 10.0, 'radius':0.8, 'color': [0.900,0.701,0.705], 'number':112},
        { 'symbol': 'ABalpppa', 'name': 'ABalpppa', 'mass': 10.0, 'radius':0.8, 'color': [0.993,0.030,0.359], 'number':113},
        { 'symbol': 'ABalpppaa', 'name': 'ABalpppaa', 'mass': 10.0, 'radius':0.8, 'color': [0.554,0.253,0.026], 'number':114},
        { 'symbol': 'ABalpppaaa', 'name': 'ABalpppaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.917,0.991,0.187], 'number':115},
        { 'symbol': 'ABalpppaap', 'name': 'ABalpppaap', 'mass': 10.0, 'radius':0.8, 'color': [0.227,0.006,0.465], 'number':116},
        { 'symbol': 'ABalpppap', 'name': 'ABalpppap', 'mass': 10.0, 'radius':0.8, 'color': [0.632,0.532,0.967], 'number':117},
        { 'symbol': 'ABalpppapa', 'name': 'ABalpppapa', 'mass': 10.0, 'radius':0.8, 'color': [0.241,0.166,0.145], 'number':118},
        { 'symbol': 'ABalpppapp', 'name': 'ABalpppapp', 'mass': 10.0, 'radius':0.8, 'color': [0.678,0.456,0.940], 'number':119},
        { 'symbol': 'ABalpppp', 'name': 'ABalpppp', 'mass': 10.0, 'radius':0.8, 'color': [0.748,0.563,0.786], 'number':120},
        { 'symbol': 'ABalppppa', 'name': 'ABalppppa', 'mass': 10.0, 'radius':0.8, 'color': [0.298,0.855,0.405], 'number':121},
        { 'symbol': 'ABalppppaa', 'name': 'ABalppppaa', 'mass': 10.0, 'radius':0.8, 'color': [0.476,0.725,0.409], 'number':122},
        { 'symbol': 'ABalppppap', 'name': 'ABalppppap', 'mass': 10.0, 'radius':0.8, 'color': [0.164,0.468,0.588], 'number':123},
        { 'symbol': 'ABalppppp', 'name': 'ABalppppp', 'mass': 10.0, 'radius':0.8, 'color': [0.065,0.697,0.083], 'number':124},
        { 'symbol': 'ABalpppppa', 'name': 'ABalpppppa', 'mass': 10.0, 'radius':0.8, 'color': [0.759,0.151,0.037], 'number':125},
        { 'symbol': 'ABalpppppp', 'name': 'ABalpppppp', 'mass': 10.0, 'radius':0.8, 'color': [0.680,0.379,0.675], 'number':126},
        { 'symbol': 'ABar', 'name': 'ABar', 'mass': 10.0, 'radius':0.8, 'color': [0.902,0.472,0.179], 'number':127},
        { 'symbol': 'ABara', 'name': 'ABara', 'mass': 10.0, 'radius':0.8, 'color': [0.532,0.440,0.701], 'number':128},
        { 'symbol': 'ABaraa', 'name': 'ABaraa', 'mass': 10.0, 'radius':0.8, 'color': [0.165,0.515,0.410], 'number':129},
        { 'symbol': 'ABaraaa', 'name': 'ABaraaa', 'mass': 10.0, 'radius':0.8, 'color': [0.517,0.700,0.582], 'number':130},
        { 'symbol': 'ABaraaaa', 'name': 'ABaraaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.158,0.261,0.404], 'number':131},
        { 'symbol': 'ABaraaaaa', 'name': 'ABaraaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.345,0.185,0.055], 'number':132},
        { 'symbol': 'ABaraaaaaa', 'name': 'ABaraaaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.901,0.222,0.886], 'number':133},
        { 'symbol': 'ABaraaaaap', 'name': 'ABaraaaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.960,0.774,0.231], 'number':134},
        { 'symbol': 'ABaraaaap', 'name': 'ABaraaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.412,0.097,0.325], 'number':135},
        { 'symbol': 'ABaraaap', 'name': 'ABaraaap', 'mass': 10.0, 'radius':0.8, 'color': [0.402,0.364,0.776], 'number':136},
        { 'symbol': 'ABaraaapa', 'name': 'ABaraaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.386,0.610,0.707], 'number':137},
        { 'symbol': 'ABaraaapaa', 'name': 'ABaraaapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.722,0.706,0.339], 'number':138},
        { 'symbol': 'ABaraaapap', 'name': 'ABaraaapap', 'mass': 10.0, 'radius':0.8, 'color': [0.710,0.661,0.209], 'number':139},
        { 'symbol': 'ABaraaapp', 'name': 'ABaraaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.636,0.001,0.488], 'number':140},
        { 'symbol': 'ABaraaappa', 'name': 'ABaraaappa', 'mass': 10.0, 'radius':0.8, 'color': [0.907,0.928,0.253], 'number':141},
        { 'symbol': 'ABaraaappp', 'name': 'ABaraaappp', 'mass': 10.0, 'radius':0.8, 'color': [0.728,0.528,0.210], 'number':142},
        { 'symbol': 'ABaraap', 'name': 'ABaraap', 'mass': 10.0, 'radius':0.8, 'color': [0.194,0.742,0.703], 'number':143},
        { 'symbol': 'ABaraapa', 'name': 'ABaraapa', 'mass': 10.0, 'radius':0.8, 'color': [0.264,0.420,0.215], 'number':144},
        { 'symbol': 'ABaraapaa', 'name': 'ABaraapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.874,0.086,0.526], 'number':145},
        { 'symbol': 'ABaraapaaa', 'name': 'ABaraapaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.190,0.648,0.794], 'number':146},
        { 'symbol': 'ABaraapaap', 'name': 'ABaraapaap', 'mass': 10.0, 'radius':0.8, 'color': [0.537,0.676,0.097], 'number':147},
        { 'symbol': 'ABaraapap', 'name': 'ABaraapap', 'mass': 10.0, 'radius':0.8, 'color': [0.177,0.168,0.106], 'number':148},
        { 'symbol': 'ABaraapapa', 'name': 'ABaraapapa', 'mass': 10.0, 'radius':0.8, 'color': [0.546,0.275,0.110], 'number':149},
        { 'symbol': 'ABaraapapp', 'name': 'ABaraapapp', 'mass': 10.0, 'radius':0.8, 'color': [0.017,0.339,0.502], 'number':150},
        { 'symbol': 'ABaraapp', 'name': 'ABaraapp', 'mass': 10.0, 'radius':0.8, 'color': [0.039,0.482,0.086], 'number':151},
        { 'symbol': 'ABaraappa', 'name': 'ABaraappa', 'mass': 10.0, 'radius':0.8, 'color': [0.335,0.600,0.018], 'number':152},
        { 'symbol': 'ABaraappaa', 'name': 'ABaraappaa', 'mass': 10.0, 'radius':0.8, 'color': [0.960,0.910,0.865], 'number':153},
        { 'symbol': 'ABaraappap', 'name': 'ABaraappap', 'mass': 10.0, 'radius':0.8, 'color': [0.301,0.602,0.273], 'number':154},
        { 'symbol': 'ABaraappp', 'name': 'ABaraappp', 'mass': 10.0, 'radius':0.8, 'color': [0.751,0.282,0.594], 'number':155},
        { 'symbol': 'ABaraapppa', 'name': 'ABaraapppa', 'mass': 10.0, 'radius':0.8, 'color': [0.472,0.535,0.689], 'number':156},
        { 'symbol': 'ABaraapppp', 'name': 'ABaraapppp', 'mass': 10.0, 'radius':0.8, 'color': [0.883,0.041,0.291], 'number':157},
        { 'symbol': 'ABarap', 'name': 'ABarap', 'mass': 10.0, 'radius':0.8, 'color': [0.628,0.126,0.051], 'number':158},
        { 'symbol': 'ABarapa', 'name': 'ABarapa', 'mass': 10.0, 'radius':0.8, 'color': [0.242,0.027,0.043], 'number':159},
        { 'symbol': 'ABarapaa', 'name': 'ABarapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.211,0.345,0.181], 'number':160},
        { 'symbol': 'ABarapaaa', 'name': 'ABarapaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.163,0.713,0.441], 'number':161},
        { 'symbol': 'ABarapaaaa', 'name': 'ABarapaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.660,0.846,0.254], 'number':162},
        { 'symbol': 'ABarapaaap', 'name': 'ABarapaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.740,0.433,0.134], 'number':163},
        { 'symbol': 'ABarapaap', 'name': 'ABarapaap', 'mass': 10.0, 'radius':0.8, 'color': [0.094,0.468,0.820], 'number':164},
        { 'symbol': 'ABarapaapa', 'name': 'ABarapaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.117,0.842,0.247], 'number':165},
        { 'symbol': 'ABarapaapp', 'name': 'ABarapaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.283,0.934,0.468], 'number':166},
        { 'symbol': 'ABarapap', 'name': 'ABarapap', 'mass': 10.0, 'radius':0.8, 'color': [0.863,0.721,0.156], 'number':167},
        { 'symbol': 'ABarapapa', 'name': 'ABarapapa', 'mass': 10.0, 'radius':0.8, 'color': [0.864,0.847,0.240], 'number':168},
        { 'symbol': 'ABarapapaa', 'name': 'ABarapapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.036,0.366,0.936], 'number':169},
        { 'symbol': 'ABarapapap', 'name': 'ABarapapap', 'mass': 10.0, 'radius':0.8, 'color': [0.310,0.872,0.351], 'number':170},
        { 'symbol': 'ABarapapp', 'name': 'ABarapapp', 'mass': 10.0, 'radius':0.8, 'color': [0.748,0.879,0.565], 'number':171},
        { 'symbol': 'ABarapappa', 'name': 'ABarapappa', 'mass': 10.0, 'radius':0.8, 'color': [0.618,0.684,0.124], 'number':172},
        { 'symbol': 'ABarapappp', 'name': 'ABarapappp', 'mass': 10.0, 'radius':0.8, 'color': [0.807,0.270,0.153], 'number':173},
        { 'symbol': 'ABarapp', 'name': 'ABarapp', 'mass': 10.0, 'radius':0.8, 'color': [0.429,0.477,0.546], 'number':174},
        { 'symbol': 'ABarappa', 'name': 'ABarappa', 'mass': 10.0, 'radius':0.8, 'color': [0.843,0.342,0.186], 'number':175},
        { 'symbol': 'ABarappaa', 'name': 'ABarappaa', 'mass': 10.0, 'radius':0.8, 'color': [0.320,0.729,0.085], 'number':176},
        { 'symbol': 'ABarappaaa', 'name': 'ABarappaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.258,0.358,0.522], 'number':177},
        { 'symbol': 'ABarappaap', 'name': 'ABarappaap', 'mass': 10.0, 'radius':0.8, 'color': [0.249,0.389,0.612], 'number':178},
        { 'symbol': 'ABarappap', 'name': 'ABarappap', 'mass': 10.0, 'radius':0.8, 'color': [0.375,0.445,0.895], 'number':179},
        { 'symbol': 'ABarappapa', 'name': 'ABarappapa', 'mass': 10.0, 'radius':0.8, 'color': [0.993,0.587,0.779], 'number':180},
        { 'symbol': 'ABarappapp', 'name': 'ABarappapp', 'mass': 10.0, 'radius':0.8, 'color': [0.478,0.546,0.997], 'number':181},
        { 'symbol': 'ABarappp', 'name': 'ABarappp', 'mass': 10.0, 'radius':0.8, 'color': [0.605,0.477,0.774], 'number':182},
        { 'symbol': 'ABarapppa', 'name': 'ABarapppa', 'mass': 10.0, 'radius':0.8, 'color': [0.237,0.952,0.449], 'number':183},
        { 'symbol': 'ABarapppaa', 'name': 'ABarapppaa', 'mass': 10.0, 'radius':0.8, 'color': [0.951,0.179,0.938], 'number':184},
        { 'symbol': 'ABarapppap', 'name': 'ABarapppap', 'mass': 10.0, 'radius':0.8, 'color': [0.799,0.084,0.896], 'number':185},
        { 'symbol': 'ABarapppp', 'name': 'ABarapppp', 'mass': 10.0, 'radius':0.8, 'color': [0.497,0.227,0.469], 'number':186},
        { 'symbol': 'ABarappppa', 'name': 'ABarappppa', 'mass': 10.0, 'radius':0.8, 'color': [0.311,0.437,0.232], 'number':187},
        { 'symbol': 'ABarappppp', 'name': 'ABarappppp', 'mass': 10.0, 'radius':0.8, 'color': [0.027,0.397,0.477], 'number':188},
        { 'symbol': 'ABarp', 'name': 'ABarp', 'mass': 10.0, 'radius':0.8, 'color': [0.059,0.199,0.551], 'number':189},
        { 'symbol': 'ABarpa', 'name': 'ABarpa', 'mass': 10.0, 'radius':0.8, 'color': [0.392,0.685,0.541], 'number':190},
        { 'symbol': 'ABarpaa', 'name': 'ABarpaa', 'mass': 10.0, 'radius':0.8, 'color': [0.873,0.285,0.948], 'number':191},
        { 'symbol': 'ABarpaaa', 'name': 'ABarpaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.703,0.738,0.611], 'number':192},
        { 'symbol': 'ABarpaaaa', 'name': 'ABarpaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.128,0.969,0.045], 'number':193},
        { 'symbol': 'ABarpaaaaa', 'name': 'ABarpaaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.412,0.439,0.179], 'number':194},
        { 'symbol': 'ABarpaaaap', 'name': 'ABarpaaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.472,0.400,0.178], 'number':195},
        { 'symbol': 'ABarpaaap', 'name': 'ABarpaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.240,0.474,0.279], 'number':196},
        { 'symbol': 'ABarpaaapa', 'name': 'ABarpaaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.850,0.188,0.280], 'number':197},
        { 'symbol': 'ABarpaaapp', 'name': 'ABarpaaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.450,0.933,0.014], 'number':198},
        { 'symbol': 'ABarpaap', 'name': 'ABarpaap', 'mass': 10.0, 'radius':0.8, 'color': [0.668,0.195,0.562], 'number':199},
        { 'symbol': 'ABarpaapa', 'name': 'ABarpaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.339,0.378,0.787], 'number':200},
        { 'symbol': 'ABarpaapaa', 'name': 'ABarpaapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.879,0.185,0.930], 'number':201},
        { 'symbol': 'ABarpaapap', 'name': 'ABarpaapap', 'mass': 10.0, 'radius':0.8, 'color': [0.254,0.552,0.707], 'number':202},
        { 'symbol': 'ABarpaapp', 'name': 'ABarpaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.168,0.941,0.307], 'number':203},
        { 'symbol': 'ABarpaappa', 'name': 'ABarpaappa', 'mass': 10.0, 'radius':0.8, 'color': [0.853,0.365,0.483], 'number':204},
        { 'symbol': 'ABarpaappp', 'name': 'ABarpaappp', 'mass': 10.0, 'radius':0.8, 'color': [0.966,0.533,0.669], 'number':205},
        { 'symbol': 'ABarpap', 'name': 'ABarpap', 'mass': 10.0, 'radius':0.8, 'color': [0.062,0.015,0.348], 'number':206},
        { 'symbol': 'ABarpapa', 'name': 'ABarpapa', 'mass': 10.0, 'radius':0.8, 'color': [0.442,0.942,0.074], 'number':207},
        { 'symbol': 'ABarpapaa', 'name': 'ABarpapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.635,0.485,0.826], 'number':208},
        { 'symbol': 'ABarpapaaa', 'name': 'ABarpapaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.851,0.397,0.097], 'number':209},
        { 'symbol': 'ABarpapaap', 'name': 'ABarpapaap', 'mass': 10.0, 'radius':0.8, 'color': [0.581,0.086,0.361], 'number':210},
        { 'symbol': 'ABarpapap', 'name': 'ABarpapap', 'mass': 10.0, 'radius':0.8, 'color': [0.477,0.302,0.046], 'number':211},
        { 'symbol': 'ABarpapapa', 'name': 'ABarpapapa', 'mass': 10.0, 'radius':0.8, 'color': [0.696,0.288,0.023], 'number':212},
        { 'symbol': 'ABarpapapp', 'name': 'ABarpapapp', 'mass': 10.0, 'radius':0.8, 'color': [0.882,0.337,0.170], 'number':213},
        { 'symbol': 'ABarpapp', 'name': 'ABarpapp', 'mass': 10.0, 'radius':0.8, 'color': [0.852,0.674,0.428], 'number':214},
        { 'symbol': 'ABarpappa', 'name': 'ABarpappa', 'mass': 10.0, 'radius':0.8, 'color': [0.930,0.089,0.442], 'number':215},
        { 'symbol': 'ABarpappaa', 'name': 'ABarpappaa', 'mass': 10.0, 'radius':0.8, 'color': [0.944,0.771,0.267], 'number':216},
        { 'symbol': 'ABarpappap', 'name': 'ABarpappap', 'mass': 10.0, 'radius':0.8, 'color': [0.438,0.512,0.601], 'number':217},
        { 'symbol': 'ABarpappp', 'name': 'ABarpappp', 'mass': 10.0, 'radius':0.8, 'color': [0.365,0.155,0.540], 'number':218},
        { 'symbol': 'ABarpapppa', 'name': 'ABarpapppa', 'mass': 10.0, 'radius':0.8, 'color': [0.407,0.298,0.801], 'number':219},
        { 'symbol': 'ABarpapppp', 'name': 'ABarpapppp', 'mass': 10.0, 'radius':0.8, 'color': [0.573,0.469,0.022], 'number':220},
        { 'symbol': 'ABarpp', 'name': 'ABarpp', 'mass': 10.0, 'radius':0.8, 'color': [0.234,0.206,0.326], 'number':221},
        { 'symbol': 'ABarppa', 'name': 'ABarppa', 'mass': 10.0, 'radius':0.8, 'color': [0.658,0.653,0.539], 'number':222},
        { 'symbol': 'ABarppaa', 'name': 'ABarppaa', 'mass': 10.0, 'radius':0.8, 'color': [0.202,0.561,0.113], 'number':223},
        { 'symbol': 'ABarppaaa', 'name': 'ABarppaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.053,0.493,0.497], 'number':224},
        { 'symbol': 'ABarppaaaa', 'name': 'ABarppaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.295,0.839,0.324], 'number':225},
        { 'symbol': 'ABarppaaap', 'name': 'ABarppaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.368,0.904,0.691], 'number':226},
        { 'symbol': 'ABarppaap', 'name': 'ABarppaap', 'mass': 10.0, 'radius':0.8, 'color': [0.203,0.544,0.986], 'number':227},
        { 'symbol': 'ABarppaapa', 'name': 'ABarppaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.505,0.988,0.125], 'number':228},
        { 'symbol': 'ABarppaapp', 'name': 'ABarppaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.837,0.930,0.713], 'number':229},
        { 'symbol': 'ABarppap', 'name': 'ABarppap', 'mass': 10.0, 'radius':0.8, 'color': [0.469,0.525,0.729], 'number':230},
        { 'symbol': 'ABarppapa', 'name': 'ABarppapa', 'mass': 10.0, 'radius':0.8, 'color': [0.310,0.267,0.925], 'number':231},
        { 'symbol': 'ABarppapaa', 'name': 'ABarppapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.933,0.703,0.594], 'number':232},
        { 'symbol': 'ABarppapap', 'name': 'ABarppapap', 'mass': 10.0, 'radius':0.8, 'color': [0.913,0.697,0.828], 'number':233},
        { 'symbol': 'ABarppapp', 'name': 'ABarppapp', 'mass': 10.0, 'radius':0.8, 'color': [0.837,0.194,0.276], 'number':234},
        { 'symbol': 'ABarppappa', 'name': 'ABarppappa', 'mass': 10.0, 'radius':0.8, 'color': [0.346,0.201,0.717], 'number':235},
        { 'symbol': 'ABarppappp', 'name': 'ABarppappp', 'mass': 10.0, 'radius':0.8, 'color': [0.045,0.770,0.239], 'number':236},
        { 'symbol': 'ABarppp', 'name': 'ABarppp', 'mass': 10.0, 'radius':0.8, 'color': [0.788,0.438,0.253], 'number':237},
        { 'symbol': 'ABarpppa', 'name': 'ABarpppa', 'mass': 10.0, 'radius':0.8, 'color': [0.911,0.464,0.748], 'number':238},
        { 'symbol': 'ABarpppaa', 'name': 'ABarpppaa', 'mass': 10.0, 'radius':0.8, 'color': [0.499,0.336,0.395], 'number':239},
        { 'symbol': 'ABarpppaaa', 'name': 'ABarpppaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.919,0.629,0.250], 'number':240},
        { 'symbol': 'ABarpppaap', 'name': 'ABarpppaap', 'mass': 10.0, 'radius':0.8, 'color': [0.902,0.987,0.749], 'number':241},
        { 'symbol': 'ABarpppap', 'name': 'ABarpppap', 'mass': 10.0, 'radius':0.8, 'color': [0.354,0.604,0.138], 'number':242},
        { 'symbol': 'ABarpppapa', 'name': 'ABarpppapa', 'mass': 10.0, 'radius':0.8, 'color': [0.476,0.349,0.354], 'number':243},
        { 'symbol': 'ABarpppapp', 'name': 'ABarpppapp', 'mass': 10.0, 'radius':0.8, 'color': [0.252,0.026,0.294], 'number':244},
        { 'symbol': 'ABarpppp', 'name': 'ABarpppp', 'mass': 10.0, 'radius':0.8, 'color': [0.790,0.330,0.999], 'number':245},
        { 'symbol': 'ABarppppa', 'name': 'ABarppppa', 'mass': 10.0, 'radius':0.8, 'color': [0.478,0.313,0.471], 'number':246},
        { 'symbol': 'ABarppppaa', 'name': 'ABarppppaa', 'mass': 10.0, 'radius':0.8, 'color': [0.182,0.739,0.190], 'number':247},
        { 'symbol': 'ABarppppap', 'name': 'ABarppppap', 'mass': 10.0, 'radius':0.8, 'color': [0.694,0.923,0.732], 'number':248},
        { 'symbol': 'ABarppppp', 'name': 'ABarppppp', 'mass': 10.0, 'radius':0.8, 'color': [0.437,0.371,0.351], 'number':249},
        { 'symbol': 'ABarpppppa', 'name': 'ABarpppppa', 'mass': 10.0, 'radius':0.8, 'color': [0.495,0.248,0.267], 'number':250},
        { 'symbol': 'ABarpppppp', 'name': 'ABarpppppp', 'mass': 10.0, 'radius':0.8, 'color': [0.476,0.794,0.776], 'number':251},
        { 'symbol': 'ABp', 'name': 'ABp', 'mass': 10.0, 'radius':0.8, 'color': [0.354,0.929,0.210], 'number':252},
        { 'symbol': 'ABpl', 'name': 'ABpl', 'mass': 10.0, 'radius':0.8, 'color': [0.216,0.582,0.891], 'number':253},
        { 'symbol': 'ABpla', 'name': 'ABpla', 'mass': 10.0, 'radius':0.8, 'color': [0.273,0.382,0.334], 'number':254},
        { 'symbol': 'ABplaa', 'name': 'ABplaa', 'mass': 10.0, 'radius':0.8, 'color': [0.546,0.999,0.775], 'number':255},
        { 'symbol': 'ABplaaa', 'name': 'ABplaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.023,0.037,0.525], 'number':256},
        { 'symbol': 'ABplaaaa', 'name': 'ABplaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.090,0.503,0.791], 'number':257},
        { 'symbol': 'ABplaaaaa', 'name': 'ABplaaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.238,0.613,0.098], 'number':258},
        { 'symbol': 'ABplaaaaaa', 'name': 'ABplaaaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.999,0.464,0.711], 'number':259},
        { 'symbol': 'ABplaaaaap', 'name': 'ABplaaaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.818,0.192,0.940], 'number':260},
        { 'symbol': 'ABplaaaap', 'name': 'ABplaaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.382,0.706,0.073], 'number':261},
        { 'symbol': 'ABplaaaapa', 'name': 'ABplaaaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.374,0.527,0.931], 'number':262},
        { 'symbol': 'ABplaaaapp', 'name': 'ABplaaaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.309,0.367,0.862], 'number':263},
        { 'symbol': 'ABplaaap', 'name': 'ABplaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.184,0.793,0.994], 'number':264},
        { 'symbol': 'ABplaaapa', 'name': 'ABplaaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.305,0.230,0.111], 'number':265},
        { 'symbol': 'ABplaaapaa', 'name': 'ABplaaapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.604,0.210,0.526], 'number':266},
        { 'symbol': 'ABplaaapap', 'name': 'ABplaaapap', 'mass': 10.0, 'radius':0.8, 'color': [0.747,0.366,0.913], 'number':267},
        { 'symbol': 'ABplaaapp', 'name': 'ABplaaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.913,0.251,0.263], 'number':268},
        { 'symbol': 'ABplaaappa', 'name': 'ABplaaappa', 'mass': 10.0, 'radius':0.8, 'color': [0.988,0.525,0.764], 'number':269},
        { 'symbol': 'ABplaaappp', 'name': 'ABplaaappp', 'mass': 10.0, 'radius':0.8, 'color': [0.303,0.100,0.641], 'number':270},
        { 'symbol': 'ABplaap', 'name': 'ABplaap', 'mass': 10.0, 'radius':0.8, 'color': [0.801,0.590,0.348], 'number':271},
        { 'symbol': 'ABplaapa', 'name': 'ABplaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.151,0.156,0.359], 'number':272},
        { 'symbol': 'ABplaapaa', 'name': 'ABplaapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.964,0.449,0.761], 'number':273},
        { 'symbol': 'ABplaapaaa', 'name': 'ABplaapaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.343,0.472,0.710], 'number':274},
        { 'symbol': 'ABplaapaap', 'name': 'ABplaapaap', 'mass': 10.0, 'radius':0.8, 'color': [0.535,0.477,0.461], 'number':275},
        { 'symbol': 'ABplaapap', 'name': 'ABplaapap', 'mass': 10.0, 'radius':0.8, 'color': [0.020,0.726,0.013], 'number':276},
        { 'symbol': 'ABplaapapa', 'name': 'ABplaapapa', 'mass': 10.0, 'radius':0.8, 'color': [0.592,0.095,0.286], 'number':277},
        { 'symbol': 'ABplaapapp', 'name': 'ABplaapapp', 'mass': 10.0, 'radius':0.8, 'color': [0.911,0.080,0.538], 'number':278},
        { 'symbol': 'ABplaapp', 'name': 'ABplaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.214,0.394,0.842], 'number':279},
        { 'symbol': 'ABplaappa', 'name': 'ABplaappa', 'mass': 10.0, 'radius':0.8, 'color': [0.572,0.084,0.887], 'number':280},
        { 'symbol': 'ABplaappaa', 'name': 'ABplaappaa', 'mass': 10.0, 'radius':0.8, 'color': [0.800,0.264,0.383], 'number':281},
        { 'symbol': 'ABplaappap', 'name': 'ABplaappap', 'mass': 10.0, 'radius':0.8, 'color': [0.648,0.247,0.510], 'number':282},
        { 'symbol': 'ABplaappp', 'name': 'ABplaappp', 'mass': 10.0, 'radius':0.8, 'color': [0.477,0.145,0.302], 'number':283},
        { 'symbol': 'ABplaapppa', 'name': 'ABplaapppa', 'mass': 10.0, 'radius':0.8, 'color': [0.107,0.871,0.484], 'number':284},
        { 'symbol': 'ABplaapppp', 'name': 'ABplaapppp', 'mass': 10.0, 'radius':0.8, 'color': [0.772,0.564,0.566], 'number':285},
        { 'symbol': 'ABplap', 'name': 'ABplap', 'mass': 10.0, 'radius':0.8, 'color': [0.583,0.526,0.709], 'number':286},
        { 'symbol': 'ABplapa', 'name': 'ABplapa', 'mass': 10.0, 'radius':0.8, 'color': [0.310,0.102,0.594], 'number':287},
        { 'symbol': 'ABplapaa', 'name': 'ABplapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.623,0.032,0.776], 'number':288},
        { 'symbol': 'ABplapaaa', 'name': 'ABplapaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.120,0.833,0.160], 'number':289},
        { 'symbol': 'ABplapaaaa', 'name': 'ABplapaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.578,0.059,0.872], 'number':290},
        { 'symbol': 'ABplapaaap', 'name': 'ABplapaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.334,0.058,0.369], 'number':291},
        { 'symbol': 'ABplapaap', 'name': 'ABplapaap', 'mass': 10.0, 'radius':0.8, 'color': [0.010,0.344,0.803], 'number':292},
        { 'symbol': 'ABplapaapa', 'name': 'ABplapaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.498,0.484,0.865], 'number':293},
        { 'symbol': 'ABplapaapp', 'name': 'ABplapaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.320,0.877,0.662], 'number':294},
        { 'symbol': 'ABplapap', 'name': 'ABplapap', 'mass': 10.0, 'radius':0.8, 'color': [0.346,0.264,0.401], 'number':295},
        { 'symbol': 'ABplapapa', 'name': 'ABplapapa', 'mass': 10.0, 'radius':0.8, 'color': [0.617,0.307,0.849], 'number':296},
        { 'symbol': 'ABplapapaa', 'name': 'ABplapapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.373,0.321,0.318], 'number':297},
        { 'symbol': 'ABplapapap', 'name': 'ABplapapap', 'mass': 10.0, 'radius':0.8, 'color': [0.683,0.117,0.039], 'number':298},
        { 'symbol': 'ABplapapp', 'name': 'ABplapapp', 'mass': 10.0, 'radius':0.8, 'color': [0.105,0.881,0.644], 'number':299},
        { 'symbol': 'ABplapappa', 'name': 'ABplapappa', 'mass': 10.0, 'radius':0.8, 'color': [0.369,0.285,0.814], 'number':300},
        { 'symbol': 'ABplapappp', 'name': 'ABplapappp', 'mass': 10.0, 'radius':0.8, 'color': [0.886,0.053,0.056], 'number':301},
        { 'symbol': 'ABplapp', 'name': 'ABplapp', 'mass': 10.0, 'radius':0.8, 'color': [0.121,0.149,0.419], 'number':302},
        { 'symbol': 'ABplappa', 'name': 'ABplappa', 'mass': 10.0, 'radius':0.8, 'color': [0.764,0.139,0.883], 'number':303},
        { 'symbol': 'ABplappaa', 'name': 'ABplappaa', 'mass': 10.0, 'radius':0.8, 'color': [0.636,0.983,0.802], 'number':304},
        { 'symbol': 'ABplappaaa', 'name': 'ABplappaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.801,0.118,0.143], 'number':305},
        { 'symbol': 'ABplappaap', 'name': 'ABplappaap', 'mass': 10.0, 'radius':0.8, 'color': [0.156,0.182,0.095], 'number':306},
        { 'symbol': 'ABplappap', 'name': 'ABplappap', 'mass': 10.0, 'radius':0.8, 'color': [0.935,0.246,0.816], 'number':307},
        { 'symbol': 'ABplappapa', 'name': 'ABplappapa', 'mass': 10.0, 'radius':0.8, 'color': [0.183,0.456,0.984], 'number':308},
        { 'symbol': 'ABplappapp', 'name': 'ABplappapp', 'mass': 10.0, 'radius':0.8, 'color': [0.977,0.430,0.975], 'number':309},
        { 'symbol': 'ABplappp', 'name': 'ABplappp', 'mass': 10.0, 'radius':0.8, 'color': [0.125,0.444,0.125], 'number':310},
        { 'symbol': 'ABplapppa', 'name': 'ABplapppa', 'mass': 10.0, 'radius':0.8, 'color': [0.197,0.361,0.048], 'number':311},
        { 'symbol': 'ABplapppaa', 'name': 'ABplapppaa', 'mass': 10.0, 'radius':0.8, 'color': [0.361,0.388,0.558], 'number':312},
        { 'symbol': 'ABplapppap', 'name': 'ABplapppap', 'mass': 10.0, 'radius':0.8, 'color': [0.894,0.785,0.988], 'number':313},
        { 'symbol': 'ABplapppp', 'name': 'ABplapppp', 'mass': 10.0, 'radius':0.8, 'color': [0.950,0.351,0.600], 'number':314},
        { 'symbol': 'ABplappppa', 'name': 'ABplappppa', 'mass': 10.0, 'radius':0.8, 'color': [0.264,0.481,0.905], 'number':315},
        { 'symbol': 'ABplappppp', 'name': 'ABplappppp', 'mass': 10.0, 'radius':0.8, 'color': [0.376,0.068,0.038], 'number':316},
        { 'symbol': 'ABplp', 'name': 'ABplp', 'mass': 10.0, 'radius':0.8, 'color': [0.287,0.817,0.961], 'number':317},
        { 'symbol': 'ABplpa', 'name': 'ABplpa', 'mass': 10.0, 'radius':0.8, 'color': [0.343,0.756,0.091], 'number':318},
        { 'symbol': 'ABplpaa', 'name': 'ABplpaa', 'mass': 10.0, 'radius':0.8, 'color': [0.898,4.127,0.853], 'number':319},
        { 'symbol': 'ABplpaaa', 'name': 'ABplpaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.697,0.683,0.596], 'number':320},
        { 'symbol': 'ABplpaaaa', 'name': 'ABplpaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.434,0.736,0.357], 'number':321},
        { 'symbol': 'ABplpaaaaa', 'name': 'ABplpaaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.849,0.865,0.034], 'number':322},
        { 'symbol': 'ABplpaaaap', 'name': 'ABplpaaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.006,0.474,0.798], 'number':323},
        { 'symbol': 'ABplpaaap', 'name': 'ABplpaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.031,0.742,0.339], 'number':324},
        { 'symbol': 'ABplpaaapa', 'name': 'ABplpaaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.770,0.627,0.826], 'number':325},
        { 'symbol': 'ABplpaaapp', 'name': 'ABplpaaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.540,0.272,0.645], 'number':326},
        { 'symbol': 'ABplpaap', 'name': 'ABplpaap', 'mass': 10.0, 'radius':0.8, 'color': [0.582,0.271,0.689], 'number':327},
        { 'symbol': 'ABplpaapa', 'name': 'ABplpaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.987,0.943,0.130], 'number':328},
        { 'symbol': 'ABplpaapaa', 'name': 'ABplpaapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.893,0.534,0.662], 'number':329},
        { 'symbol': 'ABplpaapap', 'name': 'ABplpaapap', 'mass': 10.0, 'radius':0.8, 'color': [0.043,0.327,0.335], 'number':330},
        { 'symbol': 'ABplpaapp', 'name': 'ABplpaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.340,0.037,0.683], 'number':331},
        { 'symbol': 'ABplpaappa', 'name': 'ABplpaappa', 'mass': 10.0, 'radius':0.8, 'color': [0.619,0.094,0.687], 'number':332},
        { 'symbol': 'ABplpaappp', 'name': 'ABplpaappp', 'mass': 10.0, 'radius':0.8, 'color': [0.729,0.199,0.377], 'number':333},
        { 'symbol': 'ABplpap', 'name': 'ABplpap', 'mass': 10.0, 'radius':0.8, 'color': [0.805,0.061,0.203], 'number':334},
        { 'symbol': 'ABplpapa', 'name': 'ABplpapa', 'mass': 10.0, 'radius':0.8, 'color': [0.863,0.099,0.131], 'number':335},
        { 'symbol': 'ABplpapaa', 'name': 'ABplpapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.959,0.431,0.152], 'number':336},
        { 'symbol': 'ABplpapaaa', 'name': 'ABplpapaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.247,0.635,0.414], 'number':337},
        { 'symbol': 'ABplpapaap', 'name': 'ABplpapaap', 'mass': 10.0, 'radius':0.8, 'color': [0.686,0.763,0.383], 'number':338},
        { 'symbol': 'ABplpapap', 'name': 'ABplpapap', 'mass': 10.0, 'radius':0.8, 'color': [0.812,0.989,0.621], 'number':339},
        { 'symbol': 'ABplpapapa', 'name': 'ABplpapapa', 'mass': 10.0, 'radius':0.8, 'color': [0.330,0.725,0.401], 'number':340},
        { 'symbol': 'ABplpapapp', 'name': 'ABplpapapp', 'mass': 10.0, 'radius':0.8, 'color': [0.089,0.704,0.305], 'number':341},
        { 'symbol': 'ABplpapp', 'name': 'ABplpapp', 'mass': 10.0, 'radius':0.8, 'color': [0.557,0.735,0.733], 'number':342},
        { 'symbol': 'ABplpappa', 'name': 'ABplpappa', 'mass': 10.0, 'radius':0.8, 'color': [0.583,0.527,0.302], 'number':343},
        { 'symbol': 'ABplpappaa', 'name': 'ABplpappaa', 'mass': 10.0, 'radius':0.8, 'color': [0.292,0.138,0.586], 'number':344},
        { 'symbol': 'ABplpappap', 'name': 'ABplpappap', 'mass': 10.0, 'radius':0.8, 'color': [0.791,0.493,0.215], 'number':345},
        { 'symbol': 'ABplpappp', 'name': 'ABplpappp', 'mass': 10.0, 'radius':0.8, 'color': [0.281,0.715,0.594], 'number':346},
        { 'symbol': 'ABplpapppa', 'name': 'ABplpapppa', 'mass': 10.0, 'radius':0.8, 'color': [0.753,0.369,0.841], 'number':347},
        { 'symbol': 'ABplpapppp', 'name': 'ABplpapppp', 'mass': 10.0, 'radius':0.8, 'color': [0.035,0.913,0.339], 'number':348},
        { 'symbol': 'ABplpp', 'name': 'ABplpp', 'mass': 10.0, 'radius':0.8, 'color': [0.681,0.100,0.900], 'number':349},
        { 'symbol': 'ABplppa', 'name': 'ABplppa', 'mass': 10.0, 'radius':0.8, 'color': [0.225,0.426,0.073], 'number':350},
        { 'symbol': 'ABplppaa', 'name': 'ABplppaa', 'mass': 10.0, 'radius':0.8, 'color': [0.047,0.492,0.953], 'number':351},
        { 'symbol': 'ABplppaaa', 'name': 'ABplppaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.069,0.497,0.335], 'number':352},
        { 'symbol': 'ABplppaaaa', 'name': 'ABplppaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.578,0.088,0.392], 'number':353},
        { 'symbol': 'ABplppaaap', 'name': 'ABplppaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.901,0.578,0.407], 'number':354},
        { 'symbol': 'ABplppaap', 'name': 'ABplppaap', 'mass': 10.0, 'radius':0.8, 'color': [0.434,0.952,0.792], 'number':355},
        { 'symbol': 'ABplppaapa', 'name': 'ABplppaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.889,0.015,0.710], 'number':356},
        { 'symbol': 'ABplppaapp', 'name': 'ABplppaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.164,0.995,0.458], 'number':357},
        { 'symbol': 'ABplppap', 'name': 'ABplppap', 'mass': 10.0, 'radius':0.8, 'color': [0.643,0.669,0.120], 'number':358},
        { 'symbol': 'ABplppapa', 'name': 'ABplppapa', 'mass': 10.0, 'radius':0.8, 'color': [0.458,0.462,0.310], 'number':359},
        { 'symbol': 'ABplppapaa', 'name': 'ABplppapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.991,0.091,0.645], 'number':360},
        { 'symbol': 'ABplppapap', 'name': 'ABplppapap', 'mass': 10.0, 'radius':0.8, 'color': [0.628,0.815,0.607], 'number':361},
        { 'symbol': 'ABplppapp', 'name': 'ABplppapp', 'mass': 10.0, 'radius':0.8, 'color': [0.753,0.996,0.353], 'number':362},
        { 'symbol': 'ABplppappa', 'name': 'ABplppappa', 'mass': 10.0, 'radius':0.8, 'color': [0.724,0.446,0.775], 'number':363},
        { 'symbol': 'ABplppappp', 'name': 'ABplppappp', 'mass': 10.0, 'radius':0.8, 'color': [0.665,0.704,0.364], 'number':364},
        { 'symbol': 'ABplppp', 'name': 'ABplppp', 'mass': 10.0, 'radius':0.8, 'color': [0.645,0.644,0.149], 'number':365},
        { 'symbol': 'ABplpppa', 'name': 'ABplpppa', 'mass': 10.0, 'radius':0.8, 'color': [0.952,0.499,0.920], 'number':366},
        { 'symbol': 'ABplpppaa', 'name': 'ABplpppaa', 'mass': 10.0, 'radius':0.8, 'color': [0.750,0.437,0.869], 'number':367},
        { 'symbol': 'ABplpppaaa', 'name': 'ABplpppaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.702,0.917,0.818], 'number':368},
        { 'symbol': 'ABplpppaap', 'name': 'ABplpppaap', 'mass': 10.0, 'radius':0.8, 'color': [0.893,0.026,0.741], 'number':369},
        { 'symbol': 'ABplpppap', 'name': 'ABplpppap', 'mass': 10.0, 'radius':0.8, 'color': [0.596,0.854,0.663], 'number':370},
        { 'symbol': 'ABplpppapa', 'name': 'ABplpppapa', 'mass': 10.0, 'radius':0.8, 'color': [0.816,0.741,0.816], 'number':371},
        { 'symbol': 'ABplpppapp', 'name': 'ABplpppapp', 'mass': 10.0, 'radius':0.8, 'color': [0.704,0.380,0.406], 'number':372},
        { 'symbol': 'ABplpppp', 'name': 'ABplpppp', 'mass': 10.0, 'radius':0.8, 'color': [0.271,0.881,0.552], 'number':373},
        { 'symbol': 'ABplppppa', 'name': 'ABplppppa', 'mass': 10.0, 'radius':0.8, 'color': [0.284,0.328,0.692], 'number':374},
        { 'symbol': 'ABplppppaa', 'name': 'ABplppppaa', 'mass': 10.0, 'radius':0.8, 'color': [0.779,0.379,0.411], 'number':375},
        { 'symbol': 'ABplppppap', 'name': 'ABplppppap', 'mass': 10.0, 'radius':0.8, 'color': [0.276,0.443,0.502], 'number':376},
        { 'symbol': 'ABplppppp', 'name': 'ABplppppp', 'mass': 10.0, 'radius':0.8, 'color': [0.729,0.511,0.162], 'number':377},
        { 'symbol': 'ABplpppppa', 'name': 'ABplpppppa', 'mass': 10.0, 'radius':0.8, 'color': [0.112,0.047,0.236], 'number':378},
        { 'symbol': 'ABplpppppp', 'name': 'ABplpppppp', 'mass': 10.0, 'radius':0.8, 'color': [0.934,0.766,0.319], 'number':379},
        { 'symbol': 'ABpr', 'name': 'ABpr', 'mass': 10.0, 'radius':0.8, 'color': [0.836,0.519,0.601], 'number':380},
        { 'symbol': 'ABpra', 'name': 'ABpra', 'mass': 10.0, 'radius':0.8, 'color': [0.525,0.550,0.357], 'number':381},
        { 'symbol': 'ABpraa', 'name': 'ABpraa', 'mass': 10.0, 'radius':0.8, 'color': [0.741,0.736,0.552], 'number':382},
        { 'symbol': 'ABpraaa', 'name': 'ABpraaa', 'mass': 10.0, 'radius':0.8, 'color': [0.338,0.435,0.710], 'number':383},
        { 'symbol': 'ABpraaaa', 'name': 'ABpraaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.458,0.891,0.729], 'number':384},
        { 'symbol': 'ABpraaaaa', 'name': 'ABpraaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.169,0.802,0.750], 'number':385},
        { 'symbol': 'ABpraaaaaa', 'name': 'ABpraaaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.375,0.853,0.477], 'number':386},
        { 'symbol': 'ABpraaaaap', 'name': 'ABpraaaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.252,0.958,0.959], 'number':387},
        { 'symbol': 'ABpraaaap', 'name': 'ABpraaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.556,0.855,0.983], 'number':388},
        { 'symbol': 'ABpraaaapa', 'name': 'ABpraaaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.705,0.476,0.433], 'number':389},
        { 'symbol': 'ABpraaaapp', 'name': 'ABpraaaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.295,0.139,0.775], 'number':390},
        { 'symbol': 'ABpraaap', 'name': 'ABpraaap', 'mass': 10.0, 'radius':0.8, 'color': [0.877,0.461,0.321], 'number':391},
        { 'symbol': 'ABpraaapa', 'name': 'ABpraaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.471,0.548,0.658], 'number':392},
        { 'symbol': 'ABpraaapaa', 'name': 'ABpraaapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.351,0.245,0.306], 'number':393},
        { 'symbol': 'ABpraaapap', 'name': 'ABpraaapap', 'mass': 10.0, 'radius':0.8, 'color': [0.448,0.108,0.706], 'number':394},
        { 'symbol': 'ABpraaapp', 'name': 'ABpraaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.347,0.872,0.703], 'number':395},
        { 'symbol': 'ABpraaappa', 'name': 'ABpraaappa', 'mass': 10.0, 'radius':0.8, 'color': [0.858,0.781,0.705], 'number':396},
        { 'symbol': 'ABpraaappp', 'name': 'ABpraaappp', 'mass': 10.0, 'radius':0.8, 'color': [0.509,0.335,0.212], 'number':397},
        { 'symbol': 'ABpraap', 'name': 'ABpraap', 'mass': 10.0, 'radius':0.8, 'color': [0.508,0.459,0.415], 'number':398},
        { 'symbol': 'ABpraapa', 'name': 'ABpraapa', 'mass': 10.0, 'radius':0.8, 'color': [0.984,0.451,0.793], 'number':399},
        { 'symbol': 'ABpraapaa', 'name': 'ABpraapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.676,0.298,0.616], 'number':400},
        { 'symbol': 'ABpraapaaa', 'name': 'ABpraapaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.908,0.519,0.679], 'number':401},
        { 'symbol': 'ABpraapaap', 'name': 'ABpraapaap', 'mass': 10.0, 'radius':0.8, 'color': [0.668,0.715,0.485], 'number':402},
        { 'symbol': 'ABpraapap', 'name': 'ABpraapap', 'mass': 10.0, 'radius':0.8, 'color': [0.938,0.106,0.517], 'number':403},
        { 'symbol': 'ABpraapapa', 'name': 'ABpraapapa', 'mass': 10.0, 'radius':0.8, 'color': [0.415,0.346,0.652], 'number':404},
        { 'symbol': 'ABpraapapp', 'name': 'ABpraapapp', 'mass': 10.0, 'radius':0.8, 'color': [0.809,0.776,0.113], 'number':405},
        { 'symbol': 'ABpraapp', 'name': 'ABpraapp', 'mass': 10.0, 'radius':0.8, 'color': [0.580,0.840,0.354], 'number':406},
        { 'symbol': 'ABpraappa', 'name': 'ABpraappa', 'mass': 10.0, 'radius':0.8, 'color': [0.564,0.921,0.028], 'number':407},
        { 'symbol': 'ABpraappaa', 'name': 'ABpraappaa', 'mass': 10.0, 'radius':0.8, 'color': [0.017,0.619,0.913], 'number':408},
        { 'symbol': 'ABpraappap', 'name': 'ABpraappap', 'mass': 10.0, 'radius':0.8, 'color': [0.708,0.875,0.721], 'number':409},
        { 'symbol': 'ABpraappp', 'name': 'ABpraappp', 'mass': 10.0, 'radius':0.8, 'color': [0.265,0.917,0.419], 'number':410},
        { 'symbol': 'ABpraapppa', 'name': 'ABpraapppa', 'mass': 10.0, 'radius':0.8, 'color': [0.781,0.073,0.976], 'number':411},
        { 'symbol': 'ABpraapppp', 'name': 'ABpraapppp', 'mass': 10.0, 'radius':0.8, 'color': [0.382,0.652,0.389], 'number':412},
        { 'symbol': 'ABprap', 'name': 'ABprap', 'mass': 10.0, 'radius':0.8, 'color': [0.958,0.442,0.979], 'number':413},
        { 'symbol': 'ABprapa', 'name': 'ABprapa', 'mass': 10.0, 'radius':0.8, 'color': [0.177,0.457,0.166], 'number':414},
        { 'symbol': 'ABprapaa', 'name': 'ABprapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.999,0.170,0.981], 'number':415},
        { 'symbol': 'ABprapaaa', 'name': 'ABprapaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.653,0.119,0.433], 'number':416},
        { 'symbol': 'ABprapaaaa', 'name': 'ABprapaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.067,0.341,0.621], 'number':417},
        { 'symbol': 'ABprapaaap', 'name': 'ABprapaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.750,0.244,0.998], 'number':418},
        { 'symbol': 'ABprapaap', 'name': 'ABprapaap', 'mass': 10.0, 'radius':0.8, 'color': [0.391,0.518,0.894], 'number':419},
        { 'symbol': 'ABprapaapa', 'name': 'ABprapaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.695,0.397,0.899], 'number':420},
        { 'symbol': 'ABprapaapp', 'name': 'ABprapaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.091,0.897,0.064], 'number':421},
        { 'symbol': 'ABprapap', 'name': 'ABprapap', 'mass': 10.0, 'radius':0.8, 'color': [0.749,0.271,0.206], 'number':422},
        { 'symbol': 'ABprapapa', 'name': 'ABprapapa', 'mass': 10.0, 'radius':0.8, 'color': [0.807,0.764,0.505], 'number':423},
        { 'symbol': 'ABprapapaa', 'name': 'ABprapapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.005,0.548,0.990], 'number':424},
        { 'symbol': 'ABprapapap', 'name': 'ABprapapap', 'mass': 10.0, 'radius':0.8, 'color': [0.488,0.765,0.177], 'number':425},
        { 'symbol': 'ABprapapp', 'name': 'ABprapapp', 'mass': 10.0, 'radius':0.8, 'color': [0.239,0.083,0.727], 'number':426},
        { 'symbol': 'ABprapappa', 'name': 'ABprapappa', 'mass': 10.0, 'radius':0.8, 'color': [0.645,0.693,0.654], 'number':427},
        { 'symbol': 'ABprapappp', 'name': 'ABprapappp', 'mass': 10.0, 'radius':0.8, 'color': [0.752,0.943,0.572], 'number':428},
        { 'symbol': 'ABprapp', 'name': 'ABprapp', 'mass': 10.0, 'radius':0.8, 'color': [0.957,0.758,0.610], 'number':429},
        { 'symbol': 'ABprappa', 'name': 'ABprappa', 'mass': 10.0, 'radius':0.8, 'color': [0.885,0.687,0.137], 'number':430},
        { 'symbol': 'ABprappaa', 'name': 'ABprappaa', 'mass': 10.0, 'radius':0.8, 'color': [0.919,0.930,0.390], 'number':431},
        { 'symbol': 'ABprappaaa', 'name': 'ABprappaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.282,0.648,0.047], 'number':432},
        { 'symbol': 'ABprappaap', 'name': 'ABprappaap', 'mass': 10.0, 'radius':0.8, 'color': [0.201,0.550,0.062], 'number':433},
        { 'symbol': 'ABprappap', 'name': 'ABprappap', 'mass': 10.0, 'radius':0.8, 'color': [0.681,0.000,0.394], 'number':434},
        { 'symbol': 'ABprappapa', 'name': 'ABprappapa', 'mass': 10.0, 'radius':0.8, 'color': [0.433,0.247,0.374], 'number':435},
        { 'symbol': 'ABprappapp', 'name': 'ABprappapp', 'mass': 10.0, 'radius':0.8, 'color': [0.400,0.773,0.926], 'number':436},
        { 'symbol': 'ABprappp', 'name': 'ABprappp', 'mass': 10.0, 'radius':0.8, 'color': [0.583,0.367,0.703], 'number':437},
        { 'symbol': 'ABprapppa', 'name': 'ABprapppa', 'mass': 10.0, 'radius':0.8, 'color': [0.750,0.580,0.004], 'number':438},
        { 'symbol': 'ABprapppaa', 'name': 'ABprapppaa', 'mass': 10.0, 'radius':0.8, 'color': [0.703,0.883,0.965], 'number':439},
        { 'symbol': 'ABprapppap', 'name': 'ABprapppap', 'mass': 10.0, 'radius':0.8, 'color': [0.666,0.609,0.389], 'number':440},
        { 'symbol': 'ABprapppp', 'name': 'ABprapppp', 'mass': 10.0, 'radius':0.8, 'color': [0.764,0.264,0.114], 'number':441},
        { 'symbol': 'ABprappppa', 'name': 'ABprappppa', 'mass': 10.0, 'radius':0.8, 'color': [0.080,0.709,0.174], 'number':442},
        { 'symbol': 'ABprappppp', 'name': 'ABprappppp', 'mass': 10.0, 'radius':0.8, 'color': [0.403,0.466,0.807], 'number':443},
        { 'symbol': 'ABprp', 'name': 'ABprp', 'mass': 10.0, 'radius':0.8, 'color': [0.804,0.918,0.001], 'number':444},
        { 'symbol': 'ABprpa', 'name': 'ABprpa', 'mass': 10.0, 'radius':0.8, 'color': [0.813,0.674,0.978], 'number':445},
        { 'symbol': 'ABprpaa', 'name': 'ABprpaa', 'mass': 10.0, 'radius':0.8, 'color': [0.630,0.372,0.685], 'number':446},
        { 'symbol': 'ABprpaaa', 'name': 'ABprpaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.906,0.949,0.693], 'number':447},
        { 'symbol': 'ABprpaaaa', 'name': 'ABprpaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.720,0.468,0.967], 'number':448},
        { 'symbol': 'ABprpaaaaa', 'name': 'ABprpaaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.557,0.687,0.006], 'number':449},
        { 'symbol': 'ABprpaaaap', 'name': 'ABprpaaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.642,0.579,0.222], 'number':450},
        { 'symbol': 'ABprpaaap', 'name': 'ABprpaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.227,0.999,0.040], 'number':451},
        { 'symbol': 'ABprpaaapa', 'name': 'ABprpaaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.912,0.235,0.804], 'number':452},
        { 'symbol': 'ABprpaaapp', 'name': 'ABprpaaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.552,0.133,0.536], 'number':453},
        { 'symbol': 'ABprpaap', 'name': 'ABprpaap', 'mass': 10.0, 'radius':0.8, 'color': [0.611,0.577,0.049], 'number':454},
        { 'symbol': 'ABprpaapa', 'name': 'ABprpaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.249,0.932,0.338], 'number':455},
        { 'symbol': 'ABprpaapaa', 'name': 'ABprpaapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.755,0.356,0.505], 'number':456},
        { 'symbol': 'ABprpaapap', 'name': 'ABprpaapap', 'mass': 10.0, 'radius':0.8, 'color': [0.165,0.957,0.070], 'number':457},
        { 'symbol': 'ABprpaapp', 'name': 'ABprpaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.620,0.828,0.631], 'number':458},
        { 'symbol': 'ABprpaappa', 'name': 'ABprpaappa', 'mass': 10.0, 'radius':0.8, 'color': [0.243,0.199,0.873], 'number':459},
        { 'symbol': 'ABprpaappp', 'name': 'ABprpaappp', 'mass': 10.0, 'radius':0.8, 'color': [0.913,0.779,0.165], 'number':460},
        { 'symbol': 'ABprpap', 'name': 'ABprpap', 'mass': 10.0, 'radius':0.8, 'color': [0.321,0.507,0.300], 'number':461},
        { 'symbol': 'ABprpapa', 'name': 'ABprpapa', 'mass': 10.0, 'radius':0.8, 'color': [0.960,0.686,0.612], 'number':462},
        { 'symbol': 'ABprpapaa', 'name': 'ABprpapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.555,0.572,0.580], 'number':463},
        { 'symbol': 'ABprpapaaa', 'name': 'ABprpapaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.018,0.141,0.880], 'number':464},
        { 'symbol': 'ABprpapaap', 'name': 'ABprpapaap', 'mass': 10.0, 'radius':0.8, 'color': [0.744,0.997,0.773], 'number':465},
        { 'symbol': 'ABprpapap', 'name': 'ABprpapap', 'mass': 10.0, 'radius':0.8, 'color': [0.953,0.754,0.496], 'number':466},
        { 'symbol': 'ABprpapapa', 'name': 'ABprpapapa', 'mass': 10.0, 'radius':0.8, 'color': [0.127,0.221,0.183], 'number':467},
        { 'symbol': 'ABprpapapp', 'name': 'ABprpapapp', 'mass': 10.0, 'radius':0.8, 'color': [0.331,0.700,0.308], 'number':468},
        { 'symbol': 'ABprpapp', 'name': 'ABprpapp', 'mass': 10.0, 'radius':0.8, 'color': [0.082,0.926,0.769], 'number':469},
        { 'symbol': 'ABprpappa', 'name': 'ABprpappa', 'mass': 10.0, 'radius':0.8, 'color': [0.728,0.791,0.420], 'number':470},
        { 'symbol': 'ABprpappaa', 'name': 'ABprpappaa', 'mass': 10.0, 'radius':0.8, 'color': [0.931,0.766,0.647], 'number':471},
        { 'symbol': 'ABprpappap', 'name': 'ABprpappap', 'mass': 10.0, 'radius':0.8, 'color': [0.247,0.466,0.633], 'number':472},
        { 'symbol': 'ABprpappp', 'name': 'ABprpappp', 'mass': 10.0, 'radius':0.8, 'color': [0.620,0.103,0.199], 'number':473},
        { 'symbol': 'ABprpapppa', 'name': 'ABprpapppa', 'mass': 10.0, 'radius':0.8, 'color': [0.088,0.735,0.921], 'number':474},
        { 'symbol': 'ABprpapppp', 'name': 'ABprpapppp', 'mass': 10.0, 'radius':0.8, 'color': [0.672,0.613,0.632], 'number':475},
        { 'symbol': 'ABprpp', 'name': 'ABprpp', 'mass': 10.0, 'radius':0.8, 'color': [0.918,0.570,0.648], 'number':476},
        { 'symbol': 'ABprppa', 'name': 'ABprppa', 'mass': 10.0, 'radius':0.8, 'color': [0.247,0.986,0.898], 'number':477},
        { 'symbol': 'ABprppaa', 'name': 'ABprppaa', 'mass': 10.0, 'radius':0.8, 'color': [0.414,0.049,0.473], 'number':478},
        { 'symbol': 'ABprppaaa', 'name': 'ABprppaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.051,0.785,0.875], 'number':479},
        { 'symbol': 'ABprppaaaa', 'name': 'ABprppaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.996,0.710,0.647], 'number':480},
        { 'symbol': 'ABprppaaap', 'name': 'ABprppaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.969,0.581,0.906], 'number':481},
        { 'symbol': 'ABprppaap', 'name': 'ABprppaap', 'mass': 10.0, 'radius':0.8, 'color': [0.575,0.791,0.419], 'number':482},
        { 'symbol': 'ABprppaapa', 'name': 'ABprppaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.386,0.896,0.663], 'number':483},
        { 'symbol': 'ABprppaapp', 'name': 'ABprppaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.426,0.711,0.786], 'number':484},
        { 'symbol': 'ABprppap', 'name': 'ABprppap', 'mass': 10.0, 'radius':0.8, 'color': [0.472,0.538,0.220], 'number':485},
        { 'symbol': 'ABprppapa', 'name': 'ABprppapa', 'mass': 10.0, 'radius':0.8, 'color': [0.623,0.194,0.059], 'number':486},
        { 'symbol': 'ABprppapaa', 'name': 'ABprppapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.574,0.148,0.261], 'number':487},
        { 'symbol': 'ABprppapap', 'name': 'ABprppapap', 'mass': 10.0, 'radius':0.8, 'color': [0.675,0.339,0.850], 'number':488},
        { 'symbol': 'ABprppapp', 'name': 'ABprppapp', 'mass': 10.0, 'radius':0.8, 'color': [0.856,0.079,0.700], 'number':489},
        { 'symbol': 'ABprppappa', 'name': 'ABprppappa', 'mass': 10.0, 'radius':0.8, 'color': [0.084,0.128,0.389], 'number':490},
        { 'symbol': 'ABprppappp', 'name': 'ABprppappp', 'mass': 10.0, 'radius':0.8, 'color': [0.069,0.205,0.316], 'number':491},
        { 'symbol': 'ABprppp', 'name': 'ABprppp', 'mass': 10.0, 'radius':0.8, 'color': [0.114,0.449,0.596], 'number':492},
        { 'symbol': 'ABprpppa', 'name': 'ABprpppa', 'mass': 10.0, 'radius':0.8, 'color': [0.586,0.175,0.901], 'number':493},
        { 'symbol': 'ABprpppaa', 'name': 'ABprpppaa', 'mass': 10.0, 'radius':0.8, 'color': [0.978,0.782,0.343], 'number':494},
        { 'symbol': 'ABprpppaaa', 'name': 'ABprpppaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.826,0.186,0.748], 'number':495},
        { 'symbol': 'ABprpppaap', 'name': 'ABprpppaap', 'mass': 10.0, 'radius':0.8, 'color': [0.724,0.577,0.687], 'number':496},
        { 'symbol': 'ABprpppap', 'name': 'ABprpppap', 'mass': 10.0, 'radius':0.8, 'color': [0.089,0.366,0.279], 'number':497},
        { 'symbol': 'ABprpppapa', 'name': 'ABprpppapa', 'mass': 10.0, 'radius':0.8, 'color': [0.177,0.343,0.497], 'number':498},
        { 'symbol': 'ABprpppapp', 'name': 'ABprpppapp', 'mass': 10.0, 'radius':0.8, 'color': [0.355,0.157,0.737], 'number':499},
        { 'symbol': 'ABprpppp', 'name': 'ABprpppp', 'mass': 10.0, 'radius':0.8, 'color': [0.842,0.018,0.309], 'number':500},
        { 'symbol': 'ABprppppa', 'name': 'ABprppppa', 'mass': 10.0, 'radius':0.8, 'color': [0.612,0.155,0.038], 'number':501},
        { 'symbol': 'ABprppppaa', 'name': 'ABprppppaa', 'mass': 10.0, 'radius':0.8, 'color': [0.613,0.709,0.457], 'number':502},
        { 'symbol': 'ABprppppap', 'name': 'ABprppppap', 'mass': 10.0, 'radius':0.8, 'color': [0.321,0.829,0.911], 'number':503},
        { 'symbol': 'ABprppppp', 'name': 'ABprppppp', 'mass': 10.0, 'radius':0.8, 'color': [0.145,0.717,0.743], 'number':504},
        { 'symbol': 'ABprpppppa', 'name': 'ABprpppppa', 'mass': 10.0, 'radius':0.8, 'color': [0.069,0.312,0.525], 'number':505},
        { 'symbol': 'ABprpppppp', 'name': 'ABprpppppp', 'mass': 10.0, 'radius':0.8, 'color': [0.280,0.050,0.998], 'number':506},
        { 'symbol': 'C', 'name': 'C', 'mass': 10.0, 'radius':0.8, 'color': [0.565, 0.565, 0.565], 'number':507},
        { 'symbol': 'Ca', 'name': 'Ca', 'mass': 10.0, 'radius':0.8, 'color': [0.534,0.907,0.734], 'number':508},
        { 'symbol': 'Caa', 'name': 'Caa', 'mass': 10.0, 'radius':0.8, 'color': [0.428,0.331,0.541], 'number':509},
        { 'symbol': 'Caaa', 'name': 'Caaa', 'mass': 10.0, 'radius':0.8, 'color': [0.941,0.233,0.466], 'number':510},
        { 'symbol': 'Caaaa', 'name': 'Caaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.058,0.517,0.655], 'number':511},
        { 'symbol': 'Caaaaa', 'name': 'Caaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.641,0.731,0.922], 'number':512},
        { 'symbol': 'Caaaap', 'name': 'Caaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.259,0.158,0.259], 'number':513},
        { 'symbol': 'Caaap', 'name': 'Caaap', 'mass': 10.0, 'radius':0.8, 'color': [0.706,0.757,0.596], 'number':514},
        { 'symbol': 'Caaapa', 'name': 'Caaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.479,0.664,0.493], 'number':515},
        { 'symbol': 'Caaapp', 'name': 'Caaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.139,0.603,0.857], 'number':516},
        { 'symbol': 'Caap', 'name': 'Caap', 'mass': 10.0, 'radius':0.8, 'color': [0.728,0.126,0.705], 'number':517},
        { 'symbol': 'Caapa', 'name': 'Caapa', 'mass': 10.0, 'radius':0.8, 'color': [0.681,0.105,0.322], 'number':518},
        { 'symbol': 'Caapp', 'name': 'Caapp', 'mass': 10.0, 'radius':0.8, 'color': [0.913,0.518,0.206], 'number':519},
        { 'symbol': 'Caappd', 'name': 'Caappd', 'mass': 10.0, 'radius':0.8, 'color': [0.957,0.869,0.352], 'number':520},
        { 'symbol': 'Caappv', 'name': 'Caappv', 'mass': 10.0, 'radius':0.8, 'color': [0.752,0.761,0.983], 'number':521},
        { 'symbol': 'Cap', 'name': 'Cap', 'mass': 10.0, 'radius':0.8, 'color': [0.584,0.037,0.469], 'number':522},
        { 'symbol': 'Capa', 'name': 'Capa', 'mass': 10.0, 'radius':0.8, 'color': [0.723,0.661,0.899], 'number':523},
        { 'symbol': 'Capaa', 'name': 'Capaa', 'mass': 10.0, 'radius':0.8, 'color': [0.341,0.505,0.152], 'number':524},
        { 'symbol': 'Capap', 'name': 'Capap', 'mass': 10.0, 'radius':0.8, 'color': [0.595,0.726,0.958], 'number':525},
        { 'symbol': 'Capp', 'name': 'Capp', 'mass': 10.0, 'radius':0.8, 'color': [0.202,0.949,0.060], 'number':526},
        { 'symbol': 'Cappa', 'name': 'Cappa', 'mass': 10.0, 'radius':0.8, 'color': [0.294,0.745,0.787], 'number':527},
        { 'symbol': 'Cappaa', 'name': 'Cappaa', 'mass': 10.0, 'radius':0.8, 'color': [0.506,0.619,0.469], 'number':528},
        { 'symbol': 'Cappap', 'name': 'Cappap', 'mass': 10.0, 'radius':0.8, 'color': [0.704,0.355,0.785], 'number':529},
        { 'symbol': 'Cappp', 'name': 'Cappp', 'mass': 10.0, 'radius':0.8, 'color': [0.748,0.371,0.065], 'number':530},
        { 'symbol': 'Capppa', 'name': 'Capppa', 'mass': 10.0, 'radius':0.8, 'color': [0.452,0.307,0.627], 'number':531},
        { 'symbol': 'Capppp', 'name': 'Capppp', 'mass': 10.0, 'radius':0.8, 'color': [0.674,0.031,0.947], 'number':532},
        { 'symbol': 'Cp', 'name': 'Cp', 'mass': 10.0, 'radius':0.8, 'color': [0.770,0.597,0.696], 'number':533},
        { 'symbol': 'Cpa', 'name': 'Cpa', 'mass': 10.0, 'radius':0.8, 'color': [0.248,0.385,0.958], 'number':534},
        { 'symbol': 'Cpaa', 'name': 'Cpaa', 'mass': 10.0, 'radius':0.8, 'color': [0.029,0.094,0.533], 'number':535},
        { 'symbol': 'Cpaaa', 'name': 'Cpaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.585,0.448,0.705], 'number':536},
        { 'symbol': 'Cpaaaa', 'name': 'Cpaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.941,0.406,0.768], 'number':537},
        { 'symbol': 'Cpaaap', 'name': 'Cpaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.988,0.491,0.945], 'number':538},
        { 'symbol': 'Cpaap', 'name': 'Cpaap', 'mass': 10.0, 'radius':0.8, 'color': [0.949,0.151,0.277], 'number':539},
        { 'symbol': 'Cpaapa', 'name': 'Cpaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.462,0.713,0.184], 'number':540},
        { 'symbol': 'Cpaapp', 'name': 'Cpaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.359,0.824,0.714], 'number':541},
        { 'symbol': 'Cpap', 'name': 'Cpap', 'mass': 10.0, 'radius':0.8, 'color': [0.501,0.642,0.572], 'number':542},
        { 'symbol': 'Cpapa', 'name': 'Cpapa', 'mass': 10.0, 'radius':0.8, 'color': [0.951,0.128,0.299], 'number':543},
        { 'symbol': 'Cpapaa', 'name': 'Cpapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.425,0.856,0.791], 'number':544},
        { 'symbol': 'Cpapap', 'name': 'Cpapap', 'mass': 10.0, 'radius':0.8, 'color': [0.349,0.181,0.013], 'number':545},
        { 'symbol': 'Cpapp', 'name': 'Cpapp', 'mass': 10.0, 'radius':0.8, 'color': [0.701,0.380,0.360], 'number':546},
        { 'symbol': 'Cpappd', 'name': 'Cpappd', 'mass': 10.0, 'radius':0.8, 'color': [0.388,0.076,0.427], 'number':547},
        { 'symbol': 'Cpappv', 'name': 'Cpappv', 'mass': 10.0, 'radius':0.8, 'color': [0.660,0.881,0.275], 'number':548},
        { 'symbol': 'Cpp', 'name': 'Cpp', 'mass': 10.0, 'radius':0.8, 'color': [0.295,0.100,0.585], 'number':549},
        { 'symbol': 'Cppa', 'name': 'Cppa', 'mass': 10.0, 'radius':0.8, 'color': [0.223,0.729,0.324], 'number':550},
        { 'symbol': 'Cppaa', 'name': 'Cppaa', 'mass': 10.0, 'radius':0.8, 'color': [0.974,0.870,0.146], 'number':551},
        { 'symbol': 'Cppap', 'name': 'Cppap', 'mass': 10.0, 'radius':0.8, 'color': [0.005,0.026,0.621], 'number':552},
        { 'symbol': 'Cppp', 'name': 'Cppp', 'mass': 10.0, 'radius':0.8, 'color': [0.210,0.368,0.263], 'number':553},
        { 'symbol': 'Cpppa', 'name': 'Cpppa', 'mass': 10.0, 'radius':0.8, 'color': [0.106,0.125,0.354], 'number':554},
        { 'symbol': 'Cpppaa', 'name': 'Cpppaa', 'mass': 10.0, 'radius':0.8, 'color': [0.483,0.613,0.669], 'number':555},
        { 'symbol': 'Cpppap', 'name': 'Cpppap', 'mass': 10.0, 'radius':0.8, 'color': [0.626,0.634,0.719], 'number':556},
        { 'symbol': 'Cpppp', 'name': 'Cpppp', 'mass': 10.0, 'radius':0.8, 'color': [0.331,0.013,0.108], 'number':557},
        { 'symbol': 'Cppppa', 'name': 'Cppppa', 'mass': 10.0, 'radius':0.8, 'color': [0.198,0.097,0.702], 'number':558},
        { 'symbol': 'Cppppp', 'name': 'Cppppp', 'mass': 10.0, 'radius':0.8, 'color': [0.207,0.159,0.900], 'number':559},
        { 'symbol': 'D', 'name': 'D', 'mass': 10.0, 'radius':0.8, 'color': [0.281,0.917,0.582], 'number':560},
        { 'symbol': 'Da', 'name': 'Da', 'mass': 10.0, 'radius':0.8, 'color': [0.607,0.705,0.051], 'number':561},
        { 'symbol': 'Daa', 'name': 'Daa', 'mass': 10.0, 'radius':0.8, 'color': [0.725,0.404,0.275], 'number':562},
        { 'symbol': 'Daaa', 'name': 'Daaa', 'mass': 10.0, 'radius':0.8, 'color': [0.758,0.114,0.989], 'number':563},
        { 'symbol': 'Daap', 'name': 'Daap', 'mass': 10.0, 'radius':0.8, 'color': [0.013,0.149,0.749], 'number':564},
        { 'symbol': 'Dap', 'name': 'Dap', 'mass': 10.0, 'radius':0.8, 'color': [0.433,0.866,0.994], 'number':565},
        { 'symbol': 'Dapa', 'name': 'Dapa', 'mass': 10.0, 'radius':0.8, 'color': [0.967,0.393,0.976], 'number':566},
        { 'symbol': 'Dapp', 'name': 'Dapp', 'mass': 10.0, 'radius':0.8, 'color': [0.183,0.062,0.721], 'number':567},
        { 'symbol': 'Dp', 'name': 'Dp', 'mass': 10.0, 'radius':0.8, 'color': [0.184,0.789,0.256], 'number':568},
        { 'symbol': 'Dpa', 'name': 'Dpa', 'mass': 10.0, 'radius':0.8, 'color': [0.494,0.527,0.420], 'number':569},
        { 'symbol': 'Dpaa', 'name': 'Dpaa', 'mass': 10.0, 'radius':0.8, 'color': [0.767,0.665,0.573], 'number':570},
        { 'symbol': 'Dpap', 'name': 'Dpap', 'mass': 10.0, 'radius':0.8, 'color': [0.791,0.993,0.324], 'number':571},
        { 'symbol': 'Dpp', 'name': 'Dpp', 'mass': 10.0, 'radius':0.8, 'color': [0.821,0.850,0.918], 'number':572},
        { 'symbol': 'Dppa', 'name': 'Dppa', 'mass': 10.0, 'radius':0.8, 'color': [0.879,0.141,0.904], 'number':573},
        { 'symbol': 'Dppp', 'name': 'Dppp', 'mass': 10.0, 'radius':0.8, 'color': [0.966,0.654,0.803], 'number':574},
        { 'symbol': 'E', 'name': 'E', 'mass': 10.0, 'radius':0.8, 'color': [0.824,0.576,0.126], 'number':575},
        { 'symbol': 'EMS', 'name': 'EMS', 'mass': 10.0, 'radius':0.8, 'color': [0.825,0.076,0.607], 'number':576},
        { 'symbol': 'Ea', 'name': 'Ea', 'mass': 10.0, 'radius':0.8, 'color': [0.213,0.137,0.583], 'number':577},
        { 'symbol': 'Eal', 'name': 'Eal', 'mass': 10.0, 'radius':0.8, 'color': [0.884,0.646,0.224], 'number':578},
        { 'symbol': 'Eala', 'name': 'Eala', 'mass': 10.0, 'radius':0.8, 'color': [0.532,0.634,0.018], 'number':579},
        { 'symbol': 'Ealaa', 'name': 'Ealaa', 'mass': 10.0, 'radius':0.8, 'color': [0.427,0.389,0.825], 'number':580},
        { 'symbol': 'Ealap', 'name': 'Ealap', 'mass': 10.0, 'radius':0.8, 'color': [0.168,0.251,0.360], 'number':581},
        { 'symbol': 'Ealp', 'name': 'Ealp', 'mass': 10.0, 'radius':0.8, 'color': [0.361,0.266,0.393], 'number':582},
        { 'symbol': 'Ealpa', 'name': 'Ealpa', 'mass': 10.0, 'radius':0.8, 'color': [0.102,0.596,0.919], 'number':583},
        { 'symbol': 'Ealpp', 'name': 'Ealpp', 'mass': 10.0, 'radius':0.8, 'color': [0.060,0.981,0.575], 'number':584},
        { 'symbol': 'Ear', 'name': 'Ear', 'mass': 10.0, 'radius':0.8, 'color': [0.601,0.707,0.534], 'number':585},
        { 'symbol': 'Eara', 'name': 'Eara', 'mass': 10.0, 'radius':0.8, 'color': [0.463,0.589,0.675], 'number':586},
        { 'symbol': 'Earaa', 'name': 'Earaa', 'mass': 10.0, 'radius':0.8, 'color': [0.104,0.910,0.367], 'number':587},
        { 'symbol': 'Earap', 'name': 'Earap', 'mass': 10.0, 'radius':0.8, 'color': [0.052,0.021,0.686], 'number':588},
        { 'symbol': 'Earp', 'name': 'Earp', 'mass': 10.0, 'radius':0.8, 'color': [0.044,0.958,0.026], 'number':589},
        { 'symbol': 'Earpa', 'name': 'Earpa', 'mass': 10.0, 'radius':0.8, 'color': [0.242,0.255,0.119], 'number':590},
        { 'symbol': 'Earpp', 'name': 'Earpp', 'mass': 10.0, 'radius':0.8, 'color': [0.049,0.820,0.826], 'number':591},
        { 'symbol': 'Ep', 'name': 'Ep', 'mass': 10.0, 'radius':0.8, 'color': [0.639,0.792,0.393], 'number':592},
        { 'symbol': 'Epl', 'name': 'Epl', 'mass': 10.0, 'radius':0.8, 'color': [0.751,0.438,0.523], 'number':593},
        { 'symbol': 'Epla', 'name': 'Epla', 'mass': 10.0, 'radius':0.8, 'color': [0.303,0.021,0.666], 'number':594},
        { 'symbol': 'Eplaa', 'name': 'Eplaa', 'mass': 10.0, 'radius':0.8, 'color': [0.829,0.653,0.342], 'number':595},
        { 'symbol': 'Eplap', 'name': 'Eplap', 'mass': 10.0, 'radius':0.8, 'color': [0.206,0.793,0.637], 'number':596},
        { 'symbol': 'Eplp', 'name': 'Eplp', 'mass': 10.0, 'radius':0.8, 'color': [0.604,0.399,0.609], 'number':597},
        { 'symbol': 'Eplpa', 'name': 'Eplpa', 'mass': 10.0, 'radius':0.8, 'color': [0.174,0.070,0.920], 'number':598},
        { 'symbol': 'Eplpp', 'name': 'Eplpp', 'mass': 10.0, 'radius':0.8, 'color': [0.578,0.822,0.130], 'number':599},
        { 'symbol': 'Epr', 'name': 'Epr', 'mass': 10.0, 'radius':0.8, 'color': [0.270,0.874,0.912], 'number':600},
        { 'symbol': 'Epra', 'name': 'Epra', 'mass': 10.0, 'radius':0.8, 'color': [0.637,0.118,0.423], 'number':601},
        { 'symbol': 'Epraa', 'name': 'Epraa', 'mass': 10.0, 'radius':0.8, 'color': [0.970,0.351,0.890], 'number':602},
        { 'symbol': 'Eprap', 'name': 'Eprap', 'mass': 10.0, 'radius':0.8, 'color': [0.677,0.384,0.183], 'number':603},
        { 'symbol': 'Eprp', 'name': 'Eprp', 'mass': 10.0, 'radius':0.8, 'color': [0.533,0.427,0.625], 'number':604},
        { 'symbol': 'MS', 'name': 'MS', 'mass': 10.0, 'radius':0.8, 'color': [0.680,0.131,0.737], 'number':605},
        { 'symbol': 'MSa', 'name': 'MSa', 'mass': 10.0, 'radius':0.8, 'color': [0.250,0.485,0.370], 'number':606},
        { 'symbol': 'MSaa', 'name': 'MSaa', 'mass': 10.0, 'radius':0.8, 'color': [0.409,0.029,0.404], 'number':607},
        { 'symbol': 'MSaaa', 'name': 'MSaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.692,0.087,0.005], 'number':608},
        { 'symbol': 'MSaaaa', 'name': 'MSaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.950,0.466,0.998], 'number':609},
        { 'symbol': 'MSaaaaa', 'name': 'MSaaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.296,0.456,0.234], 'number':610},
        { 'symbol': 'MSaaaaaa', 'name': 'MSaaaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.347,0.500,0.488], 'number':611},
        { 'symbol': 'MSaaaaap', 'name': 'MSaaaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.343,0.757,0.481], 'number':612},
        { 'symbol': 'MSaaaap', 'name': 'MSaaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.736,0.019,0.025], 'number':613},
        { 'symbol': 'MSaaaapa', 'name': 'MSaaaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.016,0.609,0.000], 'number':614},
        { 'symbol': 'MSaaaapp', 'name': 'MSaaaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.461,0.224,0.783], 'number':615},
        { 'symbol': 'MSaaap', 'name': 'MSaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.227,0.156,0.367], 'number':616},
        { 'symbol': 'MSaaapa', 'name': 'MSaaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.118,0.161,0.299], 'number':617},
        { 'symbol': 'MSaaapaa', 'name': 'MSaaapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.990,0.218,0.188], 'number':618},
        { 'symbol': 'MSaaapap', 'name': 'MSaaapap', 'mass': 10.0, 'radius':0.8, 'color': [0.903,0.456,0.826], 'number':619},
        { 'symbol': 'MSaaapp', 'name': 'MSaaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.252,0.675,0.913], 'number':620},
        { 'symbol': 'MSaap', 'name': 'MSaap', 'mass': 10.0, 'radius':0.8, 'color': [0.629,0.100,0.303], 'number':621},
        { 'symbol': 'MSaapa', 'name': 'MSaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.685,0.011,0.637], 'number':622},
        { 'symbol': 'MSaapaa', 'name': 'MSaapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.419,0.524,0.753], 'number':623},
        { 'symbol': 'MSaapaaa', 'name': 'MSaapaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.220,0.967,0.272], 'number':624},
        { 'symbol': 'MSaapaap', 'name': 'MSaapaap', 'mass': 10.0, 'radius':0.8, 'color': [0.624,0.504,0.452], 'number':625},
        { 'symbol': 'MSaapap', 'name': 'MSaapap', 'mass': 10.0, 'radius':0.8, 'color': [0.168,0.469,0.496], 'number':626},
        { 'symbol': 'MSaapapa', 'name': 'MSaapapa', 'mass': 10.0, 'radius':0.8, 'color': [0.030,0.541,0.082], 'number':627},
        { 'symbol': 'MSaapapp', 'name': 'MSaapapp', 'mass': 10.0, 'radius':0.8, 'color': [0.636,0.104,0.947], 'number':628},
        { 'symbol': 'MSaapp', 'name': 'MSaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.378,0.130,0.577], 'number':629},
        { 'symbol': 'MSaappa', 'name': 'MSaappa', 'mass': 10.0, 'radius':0.8, 'color': [0.472,0.391,0.512], 'number':630},
        { 'symbol': 'MSaappp', 'name': 'MSaappp', 'mass': 10.0, 'radius':0.8, 'color': [0.297,0.549,0.669], 'number':631},
        { 'symbol': 'MSap', 'name': 'MSap', 'mass': 10.0, 'radius':0.8, 'color': [0.349,0.365,0.232], 'number':632},
        { 'symbol': 'MSapa', 'name': 'MSapa', 'mass': 10.0, 'radius':0.8, 'color': [0.178,0.058,0.909], 'number':633},
        { 'symbol': 'MSapaa', 'name': 'MSapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.950,0.531,0.919], 'number':634},
        { 'symbol': 'MSapaaa', 'name': 'MSapaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.947,0.359,0.906], 'number':635},
        { 'symbol': 'MSapaaaa', 'name': 'MSapaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.163,0.840,0.085], 'number':636},
        { 'symbol': 'MSapaaap', 'name': 'MSapaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.732,0.644,0.917], 'number':637},
        { 'symbol': 'MSapaap', 'name': 'MSapaap', 'mass': 10.0, 'radius':0.8, 'color': [0.639,0.133,0.394], 'number':638},
        { 'symbol': 'MSapap', 'name': 'MSapap', 'mass': 10.0, 'radius':0.8, 'color': [0.631,0.348,0.291], 'number':639},
        { 'symbol': 'MSapapa', 'name': 'MSapapa', 'mass': 10.0, 'radius':0.8, 'color': [0.478,0.282,0.115], 'number':640},
        { 'symbol': 'MSapapaa', 'name': 'MSapapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.116,0.395,0.144], 'number':641},
        { 'symbol': 'MSapapap', 'name': 'MSapapap', 'mass': 10.0, 'radius':0.8, 'color': [0.514,0.514,0.995], 'number':642},
        { 'symbol': 'MSapapp', 'name': 'MSapapp', 'mass': 10.0, 'radius':0.8, 'color': [0.129,0.247,0.761], 'number':643},
        { 'symbol': 'MSapp', 'name': 'MSapp', 'mass': 10.0, 'radius':0.8, 'color': [0.207,0.820,0.937], 'number':644},
        { 'symbol': 'MSappa', 'name': 'MSappa', 'mass': 10.0, 'radius':0.8, 'color': [0.353,0.040,0.727], 'number':645},
        { 'symbol': 'MSappaa', 'name': 'MSappaa', 'mass': 10.0, 'radius':0.8, 'color': [0.147,0.318,0.603], 'number':646},
        { 'symbol': 'MSappap', 'name': 'MSappap', 'mass': 10.0, 'radius':0.8, 'color': [0.433,0.521,0.147], 'number':647},
        { 'symbol': 'MSappp', 'name': 'MSappp', 'mass': 10.0, 'radius':0.8, 'color': [0.488,0.664,0.391], 'number':648},
        { 'symbol': 'MSapppa', 'name': 'MSapppa', 'mass': 10.0, 'radius':0.8, 'color': [0.513,0.420,0.638], 'number':649},
        { 'symbol': 'MSapppp', 'name': 'MSapppp', 'mass': 10.0, 'radius':0.8, 'color': [0.031,0.657,0.592], 'number':650},
        { 'symbol': 'MSp', 'name': 'MSp', 'mass': 10.0, 'radius':0.8, 'color': [0.441,0.138,0.582], 'number':651},
        { 'symbol': 'MSpa', 'name': 'MSpa', 'mass': 10.0, 'radius':0.8, 'color': [0.750,0.616,0.425], 'number':652},
        { 'symbol': 'MSpaa', 'name': 'MSpaa', 'mass': 10.0, 'radius':0.8, 'color': [0.267,0.063,0.641], 'number':653},
        { 'symbol': 'MSpaaa', 'name': 'MSpaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.182,0.088,0.820], 'number':654},
        { 'symbol': 'MSpaaaa', 'name': 'MSpaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.380,0.160,0.565], 'number':655},
        { 'symbol': 'MSpaaaaa', 'name': 'MSpaaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.110,0.465,0.848], 'number':656},
        { 'symbol': 'MSpaaaap', 'name': 'MSpaaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.944,0.826,0.379], 'number':657},
        { 'symbol': 'MSpaaap', 'name': 'MSpaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.195,0.108,0.550], 'number':658},
        { 'symbol': 'MSpaaapa', 'name': 'MSpaaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.695,0.501,0.031], 'number':659},
        { 'symbol': 'MSpaaapp', 'name': 'MSpaaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.717,0.249,0.957], 'number':660},
        { 'symbol': 'MSpaap', 'name': 'MSpaap', 'mass': 10.0, 'radius':0.8, 'color': [0.475,0.498,0.975], 'number':661},
        { 'symbol': 'MSpaapa', 'name': 'MSpaapa', 'mass': 10.0, 'radius':0.8, 'color': [0.470,0.261,0.291], 'number':662},
        { 'symbol': 'MSpaapaa', 'name': 'MSpaapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.446,0.543,0.844], 'number':663},
        { 'symbol': 'MSpaapap', 'name': 'MSpaapap', 'mass': 10.0, 'radius':0.8, 'color': [0.108,0.901,0.809], 'number':664},
        { 'symbol': 'MSpaapp', 'name': 'MSpaapp', 'mass': 10.0, 'radius':0.8, 'color': [0.267,0.004,0.342], 'number':665},
        { 'symbol': 'MSpap', 'name': 'MSpap', 'mass': 10.0, 'radius':0.8, 'color': [0.848,0.020,0.625], 'number':666},
        { 'symbol': 'MSpapa', 'name': 'MSpapa', 'mass': 10.0, 'radius':0.8, 'color': [0.159,0.598,0.557], 'number':667},
        { 'symbol': 'MSpapaa', 'name': 'MSpapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.867,0.674,0.565], 'number':668},
        { 'symbol': 'MSpapaaa', 'name': 'MSpapaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.017,0.917,0.165], 'number':669},
        { 'symbol': 'MSpapaap', 'name': 'MSpapaap', 'mass': 10.0, 'radius':0.8, 'color': [0.745,0.648,0.222], 'number':670},
        { 'symbol': 'MSpapap', 'name': 'MSpapap', 'mass': 10.0, 'radius':0.8, 'color': [0.774,0.322,0.350], 'number':671},
        { 'symbol': 'MSpapapa', 'name': 'MSpapapa', 'mass': 10.0, 'radius':0.8, 'color': [0.855,0.368,0.591], 'number':672},
        { 'symbol': 'MSpapapp', 'name': 'MSpapapp', 'mass': 10.0, 'radius':0.8, 'color': [0.318,0.311,0.346], 'number':673},
        { 'symbol': 'MSpapp', 'name': 'MSpapp', 'mass': 10.0, 'radius':0.8, 'color': [0.933,0.590,0.863], 'number':674},
        { 'symbol': 'MSpappa', 'name': 'MSpappa', 'mass': 10.0, 'radius':0.8, 'color': [0.314,0.842,0.423], 'number':675},
        { 'symbol': 'MSpappp', 'name': 'MSpappp', 'mass': 10.0, 'radius':0.8, 'color': [0.572,0.368,0.199], 'number':676},
        { 'symbol': 'MSpp', 'name': 'MSpp', 'mass': 10.0, 'radius':0.8, 'color': [0.122,0.509,0.632], 'number':677},
        { 'symbol': 'MSppa', 'name': 'MSppa', 'mass': 10.0, 'radius':0.8, 'color': [0.402,0.792,0.961], 'number':678},
        { 'symbol': 'MSppaa', 'name': 'MSppaa', 'mass': 10.0, 'radius':0.8, 'color': [0.337,0.646,0.364], 'number':679},
        { 'symbol': 'MSppaaa', 'name': 'MSppaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.622,0.003,0.403], 'number':680},
        { 'symbol': 'MSppaaaa', 'name': 'MSppaaaa', 'mass': 10.0, 'radius':0.8, 'color': [0.756,0.915,0.104], 'number':681},
        { 'symbol': 'MSppaaap', 'name': 'MSppaaap', 'mass': 10.0, 'radius':0.8, 'color': [0.696,0.512,0.638], 'number':682},
        { 'symbol': 'MSppaap', 'name': 'MSppaap', 'mass': 10.0, 'radius':0.8, 'color': [0.927,0.857,0.740], 'number':683},
        { 'symbol': 'MSppap', 'name': 'MSppap', 'mass': 10.0, 'radius':0.8, 'color': [0.175,0.358,0.980], 'number':684},
        { 'symbol': 'MSppapa', 'name': 'MSppapa', 'mass': 10.0, 'radius':0.8, 'color': [0.949,0.545,0.075], 'number':685},
        { 'symbol': 'MSppapaa', 'name': 'MSppapaa', 'mass': 10.0, 'radius':0.8, 'color': [0.324,0.148,0.921], 'number':686},
        { 'symbol': 'MSppapap', 'name': 'MSppapap', 'mass': 10.0, 'radius':0.8, 'color': [0.015,0.516,0.674], 'number':687},
        { 'symbol': 'MSppapp', 'name': 'MSppapp', 'mass': 10.0, 'radius':0.8, 'color': [0.862,0.400,0.742], 'number':688},
        { 'symbol': 'MSppp', 'name': 'MSppp', 'mass': 10.0, 'radius':0.8, 'color': [0.769,0.438,0.874], 'number':689},
        { 'symbol': 'MSpppa', 'name': 'MSpppa', 'mass': 10.0, 'radius':0.8, 'color': [0.892,0.754,0.576], 'number':690},
        { 'symbol': 'MSpppaa', 'name': 'MSpppaa', 'mass': 10.0, 'radius':0.8, 'color': [0.967,0.652,0.230], 'number':691},
        { 'symbol': 'MSpppap', 'name': 'MSpppap', 'mass': 10.0, 'radius':0.8, 'color': [0.198,0.624,0.060], 'number':692},
        { 'symbol': 'MSpppp', 'name': 'MSpppp', 'mass': 10.0, 'radius':0.8, 'color': [0.927,0.928,0.119], 'number':693},
        { 'symbol': 'MSppppa', 'name': 'MSppppa', 'mass': 10.0, 'radius':0.8, 'color': [0.381,0.901,0.511], 'number':694},
        { 'symbol': 'MSppppp', 'name': 'MSppppp', 'mass': 10.0, 'radius':0.8, 'color': [0.063,0.098,0.698], 'number':695},
        { 'symbol': 'P0', 'name': 'P0', 'mass': 10.0, 'radius':0.8, 'color': [0.202,0.633,0.528], 'number':696},
        { 'symbol': 'P1', 'name': 'P1', 'mass': 10.0, 'radius':0.8, 'color': [0.331,0.077,0.601], 'number':697},
        { 'symbol': 'P2', 'name': 'P2', 'mass': 10.0, 'radius':0.8, 'color': [0.702,0.313,0.083], 'number':698},
        { 'symbol': 'P3', 'name': 'P3', 'mass': 10.0, 'radius':0.8, 'color': [0.309,0.106,0.568], 'number':699},
        { 'symbol': 'P4', 'name': 'P4', 'mass': 10.0, 'radius':0.8, 'color': [0.325,0.384,0.770], 'number':700},
        { 'symbol': 'Z2', 'name': 'Z2', 'mass': 10.0, 'radius':0.8, 'color': [0.318,0.747,0.860], 'number':701},
        { 'symbol': 'Z3', 'name': 'Z3', 'mass': 10.0, 'radius':0.8, 'color': [0.312,0.814,0.014], 'number':702},
        { 'symbol': 'O', 'name': 'oxygen', 'mass': 15.99940000, 'radius': 0.6600, 'color': [1.000, 0.051, 0.051], 'number': 8 },
        ];
        Elements.elementsBySymbol = {};
        Elements.elements.forEach(function (e) {
            Elements.elementsBySymbol[e.symbol.toUpperCase()] = e;
        });
        Elements.elementsByNumber = {};
        Elements.elements.forEach(function (e) {
            Elements.elementsByNumber[e.number] = e;
        });
        Elements.MIN_ATOM_RADIUS = Infinity;
        Elements.MAX_ATOM_RADIUS = -Infinity;
        Elements.elements.forEach(function (e) {
            Elements.MIN_ATOM_RADIUS = Math.min(Elements.MIN_ATOM_RADIUS, e.radius);
            Elements.MAX_ATOM_RADIUS = Math.max(Elements.MAX_ATOM_RADIUS, e.radius);
            //Elements.MIN_ATOM_RADIUS = 10;
            //Elements.MAX_ATOM_RADIUS = 10;
        });
    })(Elements = Molvwr.Elements || (Molvwr.Elements = {}));
})(Molvwr || (Molvwr = {}));

var Molvwr;
(function (Molvwr) {
    var Parser;
    (function (Parser) {
        function getFloat(s) {
            if (!s)
                return 0;
            return parseFloat(s.trim());
        }
        var bonds = [];
        Parser.mol = {
            parse: function (content) {
                console.log("parsing mol content");
                //console.log(content);
                // Container
                var molecule = {
                    atoms: [],
                    bonds: [],
                    bondkinds: {},
                    title: null
                };
                var lines = content.split('\n');
                molecule.title = lines[1];
                for (var i = 0, l = lines.length; i < l; i++) {
                    // Atom Lines
                    //if (lines[i].indexOf("  ") == 0) {
                    if (lines[i].indexOf("  ") == 0 & lines[i].substr(0,4) == '    ') {
                        var lineElements = lines[i].split(" ").filter(function (s) {
                            var tmp = s.trim();
                            if (tmp && tmp.length)
                                return true;
                            else
                                return false;
                        });
                        if (lineElements.length && lineElements.length >= 4) {
                            var symbol = lineElements[3].trim();
                            var x = getFloat(lineElements[0]);
                            var y = getFloat(lineElements[1]);
                            var z = getFloat(lineElements[2]);
                            var atomKind = Molvwr.Elements.elementsBySymbol[symbol.toUpperCase()];
                            if (atomKind) {
                                console.log("found atom " + atomKind.name + " " + x + "," + y + "," + z);
                                molecule.atoms.push({
                                    kind: atomKind,
                                    x: x,
                                    y: y,
                                    z: z,
                                    bonds: []
                                });
                            }
                            else {
                                console.warn("atom not found :: " + symbol);
                                /*molecule.atoms.push({
                                    kind: Molvwr.Elements.elementsBySymbol['Xx'.toUpperCase()],
                                    x: x,
                                    y: y,
                                    z: z,
                                    bonds: []
                                });*/
                            }
                        }
                    } else {
                        // We could override the bond calculating method here
                        //console.log(lines[i]);
                        if (lines[i].charAt(0) == 'B' & lines[i].charAt(1) == ' ') {
                            console.log('BONDLINE '+lines[i]);
                            var lineElements = lines[i].split(" ").filter(function (s) {
                                var tmp = s.trim();
                                if (tmp && tmp.length)
                                    return true;
                                else
                                    return false;
                            });
                            console.log(lineElements);
                            //console.log(molecule.atoms[lineElements[1]].kind);
                            var lineAtom = molecule.atoms[lineElements[1]];
                            var siblingAtom = molecule.atoms[lineElements[2]];
                            var l = new BABYLON.Vector3(lineAtom.x, lineAtom.y, lineAtom.z);
                            var m = new BABYLON.Vector3(siblingAtom.x, siblingAtom.y, siblingAtom.z);
                            var d = BABYLON.Vector3.Distance(l, m);
                            if (!molecule.bondkinds[lineAtom.kind.symbol + "#" + siblingAtom.kind.symbol]) {
                                molecule.bondkinds[lineAtom.kind.symbol + "#" + siblingAtom.kind.symbol] = { d: d, key: lineAtom.kind.symbol + "#" + siblingAtom.kind.symbol, kindA: lineAtom.kind, kindB: siblingAtom.kind, count: 1 };
                            } else {
                                molecule.bondkinds[lineAtom.kind.symbol + "#" + siblingAtom.kind.symbol].count++;
                            }
                            ///////////////////////////////////////
                            bonds.push({
                                d: d,
                                atomA: lineAtom,
                                atomB: siblingAtom,
                                cutoff: 10
                            });
                            console.log(lineAtom);
                            console.log(bonds);
                            ///////////////////////////////////////
                            //molecule.atoms[lineElements[1]]
                        }
                    }
                }
                molecule.bonds = bonds;
                console.log("found " + molecule.atoms.length+' Atoms');
                console.log(molecule.bonds);
                console.log(molecule.bondkinds);
                return molecule;
            }
        };
    })(Parser = Molvwr.Parser || (Molvwr.Parser = {}));
})(Molvwr || (Molvwr = {}));

//see http://www.wwpdb.org/documentation/file-format-content/format33/sect9.html#ANISOU for reference
var Molvwr;
(function (Molvwr) {
    var Parser;
    (function (Parser) {
        function getFloat(s) {
            if (!s)
                return 0;
            return parseFloat(s.trim());
        }
        Parser.pdb = {
            parse: function (content) {
                console.log("parsing pdb content");
                //console.log(content);
                var molecule = {
                    atoms: [],
                    title: null
                };
                var lines = content.split('\n');
                for (var i = 0, l = lines.length; i < l; i++) {
                    var line = lines[i];
                    if (line.indexOf("HETATM") == 0 || line.indexOf("ATOM") == 0) {
                        this.parseHETATM(molecule, line);
                    }
                }
                console.log("found " + molecule.title + " " + molecule.atoms.length);
                return molecule;
            },
            parseHETATM: function (molecule, line) {
                var symbol = line.substr(12, 2).trim();
                if (isNaN(symbol[0]) === false) {
                    symbol = symbol.substr(1);
                }
                var atomKind = Molvwr.Elements.elementsBySymbol[symbol.toUpperCase()];
                if (atomKind) {
                    var x = parseFloat(line.substr(30, 8).trim());
                    var y = parseFloat(line.substr(38, 8).trim());
                    var z = parseFloat(line.substr(46, 8).trim());
                    //console.log(symbol + " " + x + "," + y + "," + z);
                    molecule.atoms.push({
                        kind: atomKind,
                        x: x,
                        y: y,
                        z: z,
                        bonds: []
                    });
                }
                else {
                    console.warn("atom not found " + symbol);
                }
            }
        };
    })(Parser = Molvwr.Parser || (Molvwr.Parser = {}));
})(Molvwr || (Molvwr = {}));

var Molvwr;
(function (Molvwr) {
    var Parser;
    (function (Parser) {
        function getFloat(s) {
            if (!s)
                return 0;
            return parseFloat(s.trim());
        }
        Parser.xyz = {
            parse: function (content) {
                console.log("parsing xyz content");
                //console.log(content);
                var molecule = {
                    atoms: [],
                    title: null
                };
                var lines = content.split('\n');
                molecule.title = lines[1];
                for (var i = 2, l = lines.length; i < l; i++) {
                    var lineElements = lines[i].split(" ").filter(function (s) {
                        var tmp = s.trim();
                        if (tmp && tmp.length)
                            return true;
                        else
                            return false;
                    });
                    if (lineElements.length && lineElements.length >= 4) {
                        var symbol = lineElements[0].trim();
                        var x = getFloat(lineElements[1]);
                        var y = getFloat(lineElements[2]);
                        var z = getFloat(lineElements[3]);
                        var atomKind = Molvwr.Elements.elementsBySymbol[symbol.toUpperCase()];
                        if (atomKind) {
                            //console.log("found atom " + atomKind.name + " " + x + "," + y + "," + z);
                            molecule.atoms.push({
                                kind: atomKind,
                                x: x,
                                y: y,
                                z: z,
                                bonds: []
                            });
                        }
                        else {
                            console.warn("atom not found " + symbol);
                        }
                    }
                }
                console.log("found " + molecule.title + " " + molecule.atoms.length);
                return molecule;
            }
        };
    })(Parser = Molvwr.Parser || (Molvwr.Parser = {}));
})(Molvwr || (Molvwr = {}));

var __global = this;
var Molvwr;
(function (Molvwr) {
    var Utils;
    (function (Utils) {
        // Use polyfill for setImmediate for performance gains
        var asap = (typeof setImmediate === 'function' && setImmediate) || function (fn) { setTimeout(fn, 1); };
        var isArray = Array.isArray || function (value) { return Object.prototype.toString.call(value) === "[object Array]"; };
        function runBatch(offset, size, itemslist, itemcallback, batchname) {
            if (batchname)
                console.log(batchname + " " + offset + "/" + itemslist.length);
            return new Promise(function (complete, error) {
                asap(function () {
                    var items = itemslist.slice(offset, offset + size);
                    items.forEach(function (item, index) {
                        itemcallback(item, index, index + offset);
                    });
                    if (items.length < size) {
                        complete();
                    }
                    else {
                        //asap(()=>{					
                        runBatch(offset + size, size, itemslist, itemcallback, batchname).then(complete, error);
                    }
                });
            });
        }
        Utils.runBatch = runBatch;
        var Promise = (function () {
            function Promise(fn) {
                if (typeof this !== 'object')
                    throw new TypeError('Promises must be constructed via new');
                if (typeof fn !== 'function')
                    throw new TypeError('not a function');
                this._state = null;
                this._value = null;
                this._deferreds = [];
                doResolve(fn, resolve.bind(this), reject.bind(this));
            }
            Promise.prototype.catch = function (onRejected) {
                return this.then(null, onRejected);
            };
            Promise.prototype.then = function (onFulfilled, onRejected) {
                var me = this;
                return new Promise(function (resolve, reject) {
                    handle.call(me, new Handler(onFulfilled, onRejected, resolve, reject));
                });
            };
            Promise.timeout = function (timeoutTime) {
                var me = this;
                return new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        resolve();
                    }, timeoutTime);
                });
            };
            Promise.all = function (fake) {
                var args = Array.prototype.slice.call(arguments.length === 1 && isArray(arguments[0]) ? arguments[0] : arguments);
                return new Promise(function (resolve, reject) {
                    if (args.length === 0)
                        return resolve([]);
                    var remaining = args.length;
                    function res(i, val) {
                        try {
                            if (val && (typeof val === 'object' || typeof val === 'function')) {
                                var then = val.then;
                                if (typeof then === 'function') {
                                    then.call(val, function (val) { res(i, val); }, reject);
                                    return;
                                }
                            }
                            args[i] = val;
                            if (--remaining === 0) {
                                resolve(args);
                            }
                        }
                        catch (ex) {
                            console.error(ex);
                            reject(ex);
                        }
                    }
                    for (var i = 0; i < args.length; i++) {
                        res(i, args[i]);
                    }
                });
            };
            Promise.resolve = function (value) {
                if (value && typeof value === 'object' && value.constructor === Promise) {
                    return value;
                }
                return new Promise(function (resolve) {
                    resolve(value);
                });
            };
            Promise.reject = function (value) {
                return new Promise(function (resolveCallback, rejectCallback) {
                    rejectCallback(value);
                });
            };
            Promise.race = function (values) {
                return new Promise(function (resolveCallback, rejectCallback) {
                    for (var i = 0, len = values.length; i < len; i++) {
                        values[i].then(resolveCallback, rejectCallback);
                    }
                });
            };
            /**
            * Set the immediate function to execute callbacks
            * @param fn {function} Function to execute
            * @private
            */
            Promise._setImmediateFn = function (fn) {
                asap = fn;
            };
            return Promise;
        })();
        Utils.Promise = Promise;
        function handle(deferred) {
            var me = this;
            if (this._state === null) {
                this._deferreds.push(deferred);
                return;
            }
            asap(function () {
                var cb = me._state ? deferred.onFulfilled : deferred.onRejected;
                if (cb === null) {
                    (me._state ? deferred.resolve : deferred.reject)(me._value);
                    return;
                }
                var ret;
                try {
                    ret = cb(me._value);
                }
                catch (e) {
                    console.error(e);
                    deferred.reject(e);
                    return;
                }
                deferred.resolve(ret);
            });
        }
        function resolve(newValue) {
            try {
                if (newValue === this)
                    throw new TypeError('A promise cannot be resolved with itself.');
                if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
                    var then = newValue.then;
                    if (typeof then === 'function') {
                        doResolve(then.bind(newValue), resolve.bind(this), reject.bind(this));
                        return;
                    }
                }
                this._state = true;
                this._value = newValue;
                finale.call(this);
            }
            catch (e) {
                console.error(e);
                reject.call(this, e);
            }
        }
        function reject(newValue) {
            this._state = false;
            this._value = newValue;
            finale.call(this);
        }
        function finale() {
            for (var i = 0, len = this._deferreds.length; i < len; i++) {
                handle.call(this, this._deferreds[i]);
            }
            this._deferreds = null;
        }
        function Handler(onFulfilled, onRejected, resolve, reject) {
            this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
            this.onRejected = typeof onRejected === 'function' ? onRejected : null;
            this.resolve = resolve;
            this.reject = reject;
        }
        /**
         * Take a potentially misbehaving resolver function and make sure
         * onFulfilled and onRejected are only called once.
         *
         * Makes no guarantees about asynchrony.
         */
        function doResolve(fn, onFulfilled, onRejected) {
            var done = false;
            try {
                fn(function (value) {
                    if (done)
                        return;
                    done = true;
                    onFulfilled(value);
                }, function (reason) {
                    if (done)
                        return;
                    done = true;
                    onRejected(reason);
                });
            }
            catch (ex) {
                console.error(ex);
                if (done)
                    return;
                done = true;
                onRejected(ex);
            }
        }
    })(Utils = Molvwr.Utils || (Molvwr.Utils = {}));
})(Molvwr || (Molvwr = {}));

var Molvwr;
(function (Molvwr) {
    var Renderer;
    (function (Renderer) {
        var BondsCylinder = (function () {
            function BondsCylinder(viewer, ctx, config) {
                this.meshes = {};
                this.ctx = ctx;
                this.config = config;
                this.viewer = viewer;
            }
            BondsCylinder.prototype.render = function (molecule) {
                var _this = this;
                var cfg = this.config;
                var meshes = [];
                var diameter = Molvwr.Elements.MIN_ATOM_RADIUS * this.config.cylinderScale * this.config.atomScaleFactor;
                var nbbonds = molecule.bonds.length;
                //console.log("rendering " + nbbonds + " bonds as cylinder");
                return this.prepareBonds(molecule, diameter).then(function () {
                    console.time("cylinder rendering");
                    return Molvwr.Utils.runBatch(0, molecule.batchSize, molecule.bonds, function (b, index) {
                        var key = b.atomA.kind.symbol + "#" + b.atomB.kind.symbol;
                        var mesh = _this.meshes[key];
                        var cylinder = mesh.createInstance("bond" + index);
                        _this.alignCylinderToBinding(b.atomA, b.atomB, b.d, cylinder);
                    }, "cylinder rendering").then(function () {
                        console.timeEnd("cylinder rendering");
                    });
                });
            };
            BondsCylinder.prototype.prepareBonds = function (molecule, diameter) {
                var _this = this;
                console.time("prepare bonds as cylinder");
                var bondkinds = [];
                for (var n in molecule.bondkinds) {
                    bondkinds.push(molecule.bondkinds[n]);
                }
                var batchSize = 100;
                if (this.config.cylinderLOD) {
                    batchSize = (batchSize / this.config.cylinderLOD.length) >> 0;
                }
                return Molvwr.Utils.runBatch(0, batchSize, bondkinds, function (bondkind, index) {
                    _this.meshes[bondkind.key] = _this.createMesh(bondkind, diameter);
                }, "prepare cylinder").then(function () {
                    console.timeEnd("prepare bonds as cylinder");
                });
            };
            BondsCylinder.prototype.createMesh = function (binding, diameter) {
                //console.log("create bind mesh " + binding.key);
                if (this.config.cylinderLOD) {
                    //console.log("cylinder LOD " + this.config.cylinderLOD.length)
                    var rootConf = this.config.cylinderLOD[0];
                    var rootMesh = this.createCylinder(binding, diameter, 0, rootConf.segments, rootConf.effects, rootConf.color);
                    for (var i = 1, l = this.config.cylinderLOD.length; i < l; i++) {
                        var conf = this.config.cylinderLOD[i];
                        if (conf.segments) {
                            var childCylinder = this.createCylinder(binding, diameter, i, conf.segments, conf.effects, conf.color);
                            rootMesh.addLODLevel(conf.depth, childCylinder);
                        }
                        else {
                            rootMesh.addLODLevel(conf.depth, null);
                        }
                    }
                    return rootMesh;
                }
                else {
                    return this.createCylinder(binding, diameter, 0, this.config.cylinderSegments, true, null);
                }
            };
            BondsCylinder.prototype.createCylinder = function (binding, diameter, lodIndex, segments, useeffects, coloroverride) {
                //console.log("render cyl " + segments);
                var cylinder = BABYLON.Mesh.CreateCylinder("bondtemplate" + binding.key, binding.d, diameter, diameter, segments, 2, this.ctx.scene, false);
                var rootMat = new BABYLON.StandardMaterial('materialFor' + binding.key + lodIndex, this.ctx.scene);
                var atomAColor = coloroverride || binding.kindA.color;
                rootMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
                this.ctx.cylinderMaterial(cylinder, rootMat, useeffects);
                // var atomAMat = new BABYLON.StandardMaterial('materialFor' + binding.key + binding.kindA.symbol+ "-" + lodIndex, this.ctx.scene);
                // var atomAColor = coloroverride || binding.kindA.color;
                // atomAMat.diffuseColor = new BABYLON.Color3(atomAColor[0], atomAColor[1], atomAColor[2]);
                // this.ctx.cylinderMaterial(atomAMat, useeffects);
                // 
                // var atomBMat = new BABYLON.StandardMaterial('materialFor' + binding.key + binding.kindB.symbol+ "-" + lodIndex, this.ctx.scene);
                // var atomBColor = coloroverride || binding.kindB.color;
                // atomBMat.diffuseColor = new BABYLON.Color3(atomBColor[0], atomBColor[1], atomBColor[2]);
                // this.ctx.cylinderMaterial(atomBMat, useeffects);
                // 
                // var rootMat = new BABYLON.MultiMaterial('materialFor' + binding.key+ "-" + lodIndex, this.ctx.scene);
                // rootMat.subMaterials.push(atomAMat);
                // rootMat.subMaterials.push(atomBMat);
                // 
                // var verticesCount = cylinder.getTotalVertices();
                // var indices = cylinder.getIndices();
                // var halfindices = ((indices.length/2) >> 0) - 3*segments;
                // cylinder.subMeshes.push(new BABYLON.SubMesh(0, 0, verticesCount, 0, halfindices, cylinder));
                // cylinder.subMeshes.push(new BABYLON.SubMesh(1, 0, verticesCount, halfindices, indices.length - halfindices, cylinder));
                // 
                cylinder.material = rootMat;
                cylinder.isPickable = true;
                cylinder.setEnabled(false);
                return cylinder;
            };
            BondsCylinder.prototype.alignCylinderToBinding = function (atomA, atomB, distance, cylinder) {
                var pointA = new BABYLON.Vector3(atomA.x, atomA.y, atomA.z);
                var pointB = new BABYLON.Vector3(atomB.x, atomB.y, atomB.z);
                var v1 = pointB.subtract(pointA);
                v1.normalize();
                var v2 = new BABYLON.Vector3(0, 1, 0);
                if (this.vectorEqualsCloseEnough(v1, v2.negate())) {
                    console.log("must invert...");
                    var v2 = new BABYLON.Vector3(1, 0, 0);
                    var axis = BABYLON.Vector3.Cross(v2, v1);
                    axis.normalize();
                    var angle = BABYLON.Vector3.Dot(v1, v2);
                    angle = Math.acos(angle) + (Math.PI / 2);
                    cylinder.setPivotMatrix(BABYLON.Matrix.Translation(0, -distance / 2, 0));
                    cylinder.position = pointB;
                    var quaternion = BABYLON.Quaternion.RotationAxis(axis, angle);
                    quaternion.w = -quaternion.w;
                    cylinder.rotationQuaternion = quaternion;
                    console.log(cylinder.rotationQuaternion);
                }
                else {
                    var axis = BABYLON.Vector3.Cross(v2, v1);
                    axis.normalize();
                    var angle = BABYLON.Vector3.Dot(v1, v2);
                    angle = Math.acos(angle);
                    cylinder.setPivotMatrix(BABYLON.Matrix.Translation(0, -distance / 2, 0));
                    cylinder.position = pointB;
                    cylinder.rotationQuaternion = BABYLON.Quaternion.RotationAxis(axis, angle);
                }
            };
            BondsCylinder.prototype.vectorEqualsCloseEnough = function (v1, v2, tolerance) {
                if (tolerance === void 0) { tolerance = 0.00002; }
                if (typeof (v2) !== 'object') {
                    throw ("v2 is supposed to be an object");
                }
                if (typeof (v1) !== 'object') {
                    throw ("v1 is supposed to be an object");
                }
                if (v1.x < v2.x - tolerance || v1.x > v2.x + tolerance) {
                    return false;
                }
                if (v1.y < v2.y - tolerance || v1.y > v2.y + tolerance) {
                    return false;
                }
                if (v1.z < v2.z - tolerance || v1.z > v2.z + tolerance) {
                    return false;
                }
                return true;
            };
            return BondsCylinder;
        })();
        Renderer.BondsCylinder = BondsCylinder;
    })(Renderer = Molvwr.Renderer || (Molvwr.Renderer = {}));
})(Molvwr || (Molvwr = {}));

var Molvwr;
(function (Molvwr) {
    var Renderer;
    (function (Renderer) {
        var BondsLines = (function () {
            function BondsLines(viewer, ctx, config) {
                this.meshes = {};
                this.ctx = ctx;
                this.config = config;
                this.viewer = viewer;
            }
            BondsLines.prototype.render = function (molecule) {
                var _this = this;
                var cfg = this.config;
                var meshes = [];
                console.log("rendering bonds as lines");
                molecule.bonds.forEach(function (b, index) {
                    var line = BABYLON.Mesh.CreateLines("bond-" + index, [
                        new BABYLON.Vector3(b.atomA.x, b.atomA.y, b.atomA.z),
                        new BABYLON.Vector3(b.atomB.x, b.atomB.y, b.atomB.z),
                    ], _this.ctx.scene, false);
                    line.color = new BABYLON.Color3(0.5, 0.5, 0.5);
                    meshes.push(line);
                });
                return Molvwr.Utils.Promise.resolve();
            };
            return BondsLines;
        })();
        Renderer.BondsLines = BondsLines;
    })(Renderer = Molvwr.Renderer || (Molvwr.Renderer = {}));
})(Molvwr || (Molvwr = {}));

var Molvwr;
(function (Molvwr) {
    var Renderer;
    (function (Renderer) {
        var Sphere = (function () {
            function Sphere(viewer, ctx, config) {
                this.meshes = {};
                this.ctx = ctx;
                this.config = config;
                this.viewer = viewer;
            }
            Sphere.prototype.render = function (molecule) {
                var _this = this;
                return this.prepareMeshes(molecule).then(function () {
                    console.time("sphere rendering");
                    return Molvwr.Utils.runBatch(0, molecule.batchSize, molecule.atoms, _this.renderAtom.bind(_this), "sphere rendering").then(function () {
                        console.timeEnd("sphere rendering");
                    });
                });
            };
            Sphere.prototype.prepareMeshes = function (molecule) {
                var _this = this;
                console.time("prepare spheres");
                var kinds = [];
                for (var n in molecule.kinds) {
                    kinds.push(molecule.kinds[n]);
                }
                return Molvwr.Utils.runBatch(0, 100, kinds, function (atomkind, index) {
                    _this.meshes[atomkind.kind.symbol] = _this.createMesh(atomkind.kind);
                }, "prepare spheres").then(function () {
                    console.timeEnd("prepare spheres");
                });
            };
            Sphere.prototype.createMesh = function (atomkind) {
                if (this.config.sphereLOD) {
                    //console.log("sphere " + atomkind.symbol + " use LOD " + this.config.sphereLOD.length);
                    var rootConf = this.config.sphereLOD[0];
                    var rootMesh = this.createSphere(atomkind, rootConf.segments, rootConf.effects, rootConf.color);
                    for (var i = 1, l = this.config.sphereLOD.length; i < l; i++) {
                        var conf = this.config.sphereLOD[i];
                        if (conf.segments) {
                            var childSphere = this.createSphere(atomkind, conf.segments, conf.effects, conf.color);
                            rootMesh.addLODLevel(conf.depth, childSphere);
                        }
                        else {
                            rootMesh.addLODLevel(conf.depth, null);
                        }
                    }
                    return rootMesh;
                }
                else {
                    return this.createSphere(atomkind, this.config.sphereSegments, true, null);
                }
            };
            Sphere.prototype.createSphere = function (atomkind, segments, useEffects, overridecolor) {
                var sphere = BABYLON.Mesh.CreateSphere("spheretemplate", segments, atomkind.radius * this.config.atomScaleFactor, this.ctx.scene, false);
                sphere.setEnabled(false);
                sphere.isPickable = false;
                var atomMat = new BABYLON.StandardMaterial('materialFor' + atomkind.symbol, this.ctx.scene);
                var color = overridecolor || atomkind.color;
                atomMat.diffuseColor = new BABYLON.Color3(color[0], color[1], color[2]);
                this.ctx.sphereMaterial(sphere, atomMat, useEffects);
                sphere.material = atomMat;
                return sphere;
            };
            Sphere.prototype.renderAtom = function (atom, index) {
                var cfg = this.config;
                var mesh = this.meshes[atom.kind.symbol];
                if (!mesh) {
                    console.warn("no mesh for " + atom.kind.symbol);
                }
                var sphere = mesh.createInstance("sphere" + index);
                // sphere = BABYLON.Mesh.CreateSphere("sphere" + index, cfg.sphereSegments, atomKind.radius * cfg.scale * cfg.atomScaleFactor, this.ctx.scene);
                // sphere.material = this.ctx.getMaterial(atom.symbol);
                sphere.pickable = false;
                sphere.position.x = atom.x;
                sphere.position.y = atom.y;
                sphere.position.z = atom.z;
                return sphere;
            };
            return Sphere;
        })();
        Renderer.Sphere = Sphere;
    })(Renderer = Molvwr.Renderer || (Molvwr.Renderer = {}));
})(Molvwr || (Molvwr = {}));

var Molvwr;
(function (Molvwr) {
    var Renderer;
    (function (Renderer) {
        var Sticks = (function () {
            function Sticks(viewer, ctx, config) {
                this.meshes = {};
                this.ctx = ctx;
                this.config = config;
                this.viewer = viewer;
            }
            Sticks.prototype.render = function (molecule) {
                var _this = this;
                var cfg = this.config;
                var meshes = [];
                var diameter = Molvwr.Elements.MIN_ATOM_RADIUS * this.config.cylinderScale * this.config.atomScaleFactor;
                var nbbonds = molecule.bonds.length;
                return this.prepareBonds(molecule, diameter).then(function () {
                    console.time("sticks rendering");
                    return Molvwr.Utils.runBatch(0, molecule.batchSize, molecule.bonds, function (b, index) {
                        var key = b.atomA.kind.symbol + "#" + b.atomB.kind.symbol;
                        var mesh = _this.meshes[key];
                        var cylinder = mesh.createInstance("bond" + index);
                        _this.alignCylinderToBinding(b.atomA, b.atomB, b.d, cylinder);
                    }).then(function () {
                        console.timeEnd("sticks rendering");
                    });
                });
            };
            Sticks.prototype.prepareBonds = function (molecule, diameter) {
                var _this = this;
                console.time("prepare bonds as sticks");
                var bondkinds = [];
                for (var n in molecule.bondkinds) {
                    bondkinds.push(molecule.bondkinds[n]);
                }
                var batchSize = 50;
                if (this.config.cylinderLOD) {
                    batchSize = (batchSize / this.config.cylinderLOD.length) >> 0;
                }
                return Molvwr.Utils.runBatch(0, batchSize, bondkinds, function (bondkind, index) {
                    _this.meshes[bondkind.key] = _this.createMesh(bondkind, diameter);
                }, "prepare sticks").then(function () {
                    console.timeEnd("prepare bonds as sticks");
                });
            };
            Sticks.prototype.createMesh = function (binding, diameter) {
                var processor = this.createStickMergemesh;
                if (this.config.cylinderLOD) {
                    var rootConf = this.config.cylinderLOD[0];
                    var rootMesh = processor.apply(this, [binding, diameter, 0, rootConf.segments, rootConf.texture, rootConf.effects, rootConf.color]);
                    for (var i = 1, l = this.config.cylinderLOD.length; i < l; i++) {
                        var conf = this.config.cylinderLOD[i];
                        if (conf.segments) {
                            var childCylinder = processor.apply(this, [binding, diameter, i, conf.segments, conf.texture, conf.effects, conf.color]);
                            rootMesh.addLODLevel(conf.depth, childCylinder);
                        }
                        else {
                            rootMesh.addLODLevel(conf.depth, null);
                        }
                    }
                    return rootMesh;
                }
                else {
                    return processor.apply(this, [binding, diameter, 0, this.config.cylinderSegments, true, true, null]);
                }
            };
            Sticks.prototype.createStickMergemesh = function (binding, diameter, lodIndex, segments, texture, useeffects, coloroverride) {
                //console.log("create mesh template " + binding.key + " mergemesh " + lodIndex);
                var radius = diameter / 2;
                var cylinderSize = binding.d - (radius / 2.5);
                var halfCylinderSize = cylinderSize / 2;
                var cylinder = BABYLON.Mesh.CreateCylinder("bondtemplate" + binding.key + "-" + lodIndex, cylinderSize, diameter, diameter, segments, 2, this.ctx.scene, false);
                var cylinderIndices = cylinder.getIndices();
                var sphereA = BABYLON.Mesh.CreateSphere("sphereA" + binding.key + "-" + lodIndex, segments, diameter, this.ctx.scene, false);
                sphereA.position.y = -halfCylinderSize;
                var sphereB = BABYLON.Mesh.CreateSphere("sphereB" + binding.key + "-" + lodIndex, segments, diameter, this.ctx.scene, false);
                sphereB.position.y = halfCylinderSize;
                var capsule = BABYLON.Mesh.MergeMeshes([sphereA, cylinder, sphereB], true);
                var atomAMat = new BABYLON.StandardMaterial('materialFor' + binding.key + binding.kindA.symbol + "-" + lodIndex, this.ctx.scene);
                var atomAColor = coloroverride || binding.kindA.color;
                atomAMat.diffuseColor = new BABYLON.Color3(atomAColor[0], atomAColor[1], atomAColor[2]);
                this.ctx.cylinderMaterial(null, atomAMat, useeffects);
                var atomBMat = new BABYLON.StandardMaterial('materialFor' + binding.key + binding.kindB.symbol + "-" + lodIndex, this.ctx.scene);
                var atomBColor = coloroverride || binding.kindB.color;
                atomBMat.diffuseColor = new BABYLON.Color3(atomBColor[0], atomBColor[1], atomBColor[2]);
                this.ctx.cylinderMaterial(null, atomBMat, useeffects);
                var rootMat = new BABYLON.MultiMaterial('materialFor' + binding.key + "-" + lodIndex, this.ctx.scene);
                rootMat.subMaterials.push(atomAMat);
                rootMat.subMaterials.push(atomBMat);
                var verticesCount = capsule.getTotalVertices();
                var indices = capsule.getIndices();
                //console.log("has submeshes ? " + capsule.subMeshes.length + " indices " + indices.length);
                //console.log(indices);
                capsule.subMeshes = [];
                var halfindices = ((indices.length / 2) >> 0) - 3 * segments;
                capsule.subMeshes.push(new BABYLON.SubMesh(0, 0, verticesCount, 0, halfindices, capsule));
                capsule.subMeshes.push(new BABYLON.SubMesh(1, 0, verticesCount, halfindices, indices.length - halfindices, capsule));
                capsule.material = rootMat;
                capsule.isPickable = false;
                capsule.setEnabled(false);
                return capsule;
            };
            // 		createStickCSG(binding, diameter, lodIndex, segments, texture, useeffects, coloroverride) {
            // 			console.log("create mesh template " + binding.key + " csg " + lodIndex);
            // 			var atomAMat = new BABYLON.StandardMaterial('materialFor' + binding.key + binding.kindA.symbol + "-" + lodIndex, this.ctx.scene);
            // 			var atomAColor = coloroverride || binding.kindA.color;
            // 			//atomAMat.diffuseColor = new BABYLON.Color3(atomAColor[0], atomAColor[1], atomAColor[2]);
            // 			atomAMat.diffuseColor = new BABYLON.Color3(1, 0, 0);
            // 
            // 			atomAMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
            // 			atomAMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
            // 			this.ctx.cylinderMaterial(null, atomAMat, useeffects);
            // 
            // 			var atomBMat = new BABYLON.StandardMaterial('materialFor' + binding.key + binding.kindB.symbol + "-" + lodIndex, this.ctx.scene);
            // 			var atomBColor = coloroverride || binding.kindB.color;
            // 			//atomBMat.diffuseColor = new BABYLON.Color3(atomBColor[0], atomBColor[1], atomBColor[2]);
            // 			atomBMat.diffuseColor = new BABYLON.Color3(0, 1, 0);
            // 			atomBMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
            // 			atomBMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
            // 			this.ctx.cylinderMaterial(null, atomBMat, useeffects);
            // 
            // 			var rootMat = new BABYLON.MultiMaterial('materialFor' + binding.key + "-" + lodIndex, this.ctx.scene);
            // 			rootMat.subMaterials.push(atomAMat);
            // 			rootMat.subMaterials.push(atomBMat);
            // 
            // 			var radius = diameter / 2;
            // 			var cylinderSize = binding.d;
            // 			var halfCylinderSize = cylinderSize / 2;
            // 
            // 			var sphereA = BABYLON.Mesh.CreateSphere("sphereA" + binding.key + "-" + lodIndex, segments * 0.5, diameter, this.ctx.scene, false);
            // 			sphereA.position.y = -halfCylinderSize;
            // 			sphereA.material = atomAMat;
            // 
            // 			var cylinderA = BABYLON.Mesh.CreateCylinder("cylinderAtemplate" + binding.key + "-" + lodIndex, cylinderSize / 2, diameter, diameter, segments, 2, this.ctx.scene, false);
            // 			cylinderA.position.y = -cylinderSize / 4;
            // 			cylinderA.material = atomAMat;
            // 
            // 			var cylinderB = BABYLON.Mesh.CreateCylinder("cylinderAtemplate" + binding.key + "-" + lodIndex, cylinderSize / 2, diameter, diameter, segments, 2, this.ctx.scene, false);
            // 			cylinderB.position.y = cylinderSize / 4;
            // 			cylinderB.material = atomBMat;
            // 
            // 			var sphereB = BABYLON.Mesh.CreateSphere("sphereB" + binding.key + "-" + lodIndex, segments * 0.5, diameter, this.ctx.scene, false);
            // 			sphereB.position.y = halfCylinderSize;
            // 			sphereB.material = atomBMat;
            // 
            // 			var sphereACSG = BABYLON.CSG.FromMesh(sphereA);
            // 			var cylinderACSG = BABYLON.CSG.FromMesh(cylinderA);
            // 			var cylinderBCSG = BABYLON.CSG.FromMesh(cylinderB);
            // 			var sphereBCSG = BABYLON.CSG.FromMesh(sphereB);
            // 
            // 			var atomACSG = sphereACSG.union(cylinderACSG);
            // 			var atomBCSG = sphereBCSG.union(cylinderBCSG);
            // 
            // 			var resCSG = atomACSG.union(atomBCSG);
            // 
            // 			var capsule = resCSG.toMesh("bondtemplate" + binding.key + "-" + lodIndex, rootMat, this.ctx.scene, false);
            // 
            // 			capsule.setPivotMatrix(BABYLON.Matrix.Translation(0, -binding.d / 4, 0));
            // 
            // 			capsule.isPickable = false;
            // 			capsule.setEnabled(false);
            // 
            // 			cylinderA.setEnabled(false);
            // 			cylinderB.setEnabled(false);
            // 			sphereA.setEnabled(false);
            // 			sphereB.setEnabled(false);
            // 
            // 			return capsule;
            // 		}		
            Sticks.prototype.alignCylinderToBinding = function (atomA, atomB, distance, cylinder) {
                //console.log("position items to " + atomB.x + "/" + atomB.y  + "/" +  atomB.z)
                var pointA = new BABYLON.Vector3(atomA.x, atomA.y, atomA.z);
                var pointB = new BABYLON.Vector3(atomB.x, atomB.y, atomB.z);
                var v1 = pointB.subtract(pointA);
                v1.normalize();
                var v2 = new BABYLON.Vector3(0, 1, 0);
                if (this.vectorEqualsCloseEnough(v1, v2.negate())) {
                    //console.log("must invert...")
                    var v2 = new BABYLON.Vector3(1, 0, 0);
                    var axis = BABYLON.Vector3.Cross(v2, v1);
                    axis.normalize();
                    var angle = BABYLON.Vector3.Dot(v1, v2);
                    angle = Math.acos(angle) + (Math.PI / 2);
                    cylinder.setPivotMatrix(BABYLON.Matrix.Translation(0, -distance / 2, 0));
                    cylinder.position = pointB;
                    var quaternion = BABYLON.Quaternion.RotationAxis(axis, angle);
                    quaternion.w = -quaternion.w;
                    cylinder.rotationQuaternion = quaternion;
                    console.log(cylinder.rotationQuaternion);
                }
                else {
                    var axis = BABYLON.Vector3.Cross(v2, v1);
                    axis.normalize();
                    var angle = BABYLON.Vector3.Dot(v1, v2);
                    angle = Math.acos(angle);
                    cylinder.setPivotMatrix(BABYLON.Matrix.Translation(0, -distance / 2, 0));
                    cylinder.position = pointB;
                    cylinder.rotationQuaternion = BABYLON.Quaternion.RotationAxis(axis, angle);
                }
            };
            Sticks.prototype.vectorEqualsCloseEnough = function (v1, v2, tolerance) {
                if (tolerance === void 0) { tolerance = 0.00002; }
                if (typeof (v2) !== 'object') {
                    throw ("v2 is supposed to be an object");
                }
                if (typeof (v1) !== 'object') {
                    throw ("v1 is supposed to be an object");
                }
                if (v1.x < v2.x - tolerance || v1.x > v2.x + tolerance) {
                    return false;
                }
                if (v1.y < v2.y - tolerance || v1.y > v2.y + tolerance) {
                    return false;
                }
                if (v1.z < v2.z - tolerance || v1.z > v2.z + tolerance) {
                    return false;
                }
                return true;
            };
            return Sticks;
        })();
        Renderer.Sticks = Sticks;
    })(Renderer = Molvwr.Renderer || (Molvwr.Renderer = {}));
})(Molvwr || (Molvwr = {}));

var Molvwr;
(function (Molvwr) {
    var ViewModes;
    (function (ViewModes) {
        var Standard = (function () {
            function Standard(viewoptions) {
                this.options = viewoptions;
                if (!viewoptions) {
                    console.log("default viewmode config");
                    this.options = Molvwr.ViewModes.Standard.defaultConfig();
                }
                if (!this.options.sphere)
                    this.options.sphere = {};
                if (!this.options.cylinder)
                    this.options.cylinder = {};
            }
            Standard.defaultConfig = function () {
                var res = {
                    texture: false,
                    emisivefresnel: new BABYLON.FresnelParameters(),
                    cylinder: {},
                    sphere: {}
                };
                res.emisivefresnel.bias = 0.3;
                res.emisivefresnel.power = 1;
                res.emisivefresnel.leftColor = BABYLON.Color3.Black();
                res.emisivefresnel.rightColor = BABYLON.Color3.White();
                return res;
            };
            Standard.prototype.getColor = function (config, defaultColor) {
                if (config && config.length >= 3) {
                    return new BABYLON.Color3(config[0], config[1], config[2]);
                }
                else {
                    return new BABYLON.Color3(defaultColor[0], defaultColor[1], defaultColor[2]);
                }
            };
            Standard.prototype.createScene = function (context) {
                context.scene.clearColor = this.getColor(this.options.clearColor, [0.9, 0.9, 0.95]);
                context.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
                context.scene.fogColor = this.getColor(this.options.fogColor, [0.9, 0.9, 0.85]);
                context.scene.fogDensity = this.options.fogDensity || 0.01;
                var camera = new BABYLON.ArcRotateCamera('Camera', 1, .8, 28, new BABYLON.Vector3(0, 0, 0), context.scene);
                camera.wheelPrecision = this.options.wheelPrecision || 10;
                camera.pinchPrecision = this.options.pinchPrecision || 7;
                camera.panningSensibility = this.options.panningSensibility || 70;
                camera.setTarget(BABYLON.Vector3.Zero());
                camera.attachControl(context.canvas, false);
                context.camera = camera;
                //var light = new BABYLON.Light("simplelight", scene);
                var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), context.scene);
                light.intensity = 0.7;
                light.groundColor = this.getColor(this.options.groundColor, [0.4, 0.4, 0.4]);
                light.specular = this.getColor(this.options.specular, [0.5, 0.5, 0.5]);
            };
            Standard.prototype.applyTexture = function (context, material, texture) {
                if (texture.diffuseTexture) {
                    material.diffuseTexture = new BABYLON.Texture(texture.diffuseTexture, context.scene);
                    // (<any>material.diffuseTexture).alpha = 0.3;
                    // material.diffuseTexture.hasAlpha = true;
                    material.diffuseTexture.uScale = texture.textureScale || 1;
                    material.diffuseTexture.vScale = texture.textureScale || 1;
                }
                if (texture.specularTexture) {
                    material.specularTexture = new BABYLON.Texture(texture.specularTexture, context.scene);
                    material.specularTexture.uScale = texture.textureScale || 1;
                    material.specularTexture.vScale = texture.textureScale || 1;
                }
                if (texture.bumpTexture) {
                    material.bumpTexture = new BABYLON.Texture(texture.bumpTexture, context.scene);
                    material.bumpTexture.uScale = texture.textureScale || 1;
                    material.bumpTexture.vScale = texture.textureScale || 1;
                }
            };
            Standard.prototype.sphereMaterial = function (context, mesh, material, useEffects) {
                material.ambientColor = new BABYLON.Color3(0, 0, 1);
                material.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
                material.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
                if (useEffects) {
                    if (this.options.emisivefresnel) {
                        material.emissiveFresnelParameters = this.options.emisivefresnel;
                    }
                    if (this.options.sphere) {
                        this.applyTexture(context, material, this.options.sphere);
                    }
                }
            };
            Standard.prototype.cylinderMaterial = function (context, mesh, material, useEffects) {
                material.ambientColor = new BABYLON.Color3(0, 0, 1);
                material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
                material.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
                if (useEffects) {
                    if (this.options.emisivefresnel) {
                        material.emissiveFresnelParameters = this.options.emisivefresnel;
                    }
                    if (this.options.cylinder) {
                        this.applyTexture(context, material, this.options.cylinder);
                    }
                }
            };
            return Standard;
        })();
        ViewModes.Standard = Standard;
    })(ViewModes = Molvwr.ViewModes || (Molvwr.ViewModes = {}));
})(Molvwr || (Molvwr = {}));

var Molvwr;
(function (Molvwr) {
    var ViewModes;
    (function (ViewModes) {
        var Experiments = (function () {
            function Experiments() {
            }
            Experiments.prototype.createScene = function (context) {
                context.scene.clearColor = new BABYLON.Color3(0.9, 0.9, 0.95);
                context.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
                context.scene.fogColor = new BABYLON.Color3(0.9, 0.9, 0.85);
                context.scene.fogDensity = 0.01;
                var camera = new BABYLON.ArcRotateCamera('Camera', 1, .8, 28, new BABYLON.Vector3(0, 0, 0), context.scene);
                camera.wheelPrecision = 10;
                camera.pinchPrecision = 7;
                camera.panningSensibility = 70;
                camera.setTarget(BABYLON.Vector3.Zero());
                camera.attachControl(context.canvas, false);
                context.camera = camera;
                //var light = new BABYLON.Light("simplelight", scene);
                var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), context.scene);
                light.intensity = 0.7;
                light.groundColor = new BABYLON.Color3(0.4, 0.4, 0.4);
                light.specular = new BABYLON.Color3(0.5, 0.5, 0.5);
                //this.useAmbientOcclusion();
                //this.useHDR();
                //this.useLensEffect();
            };
            Experiments.prototype.sphereMaterial = function (context, mesh, material, useEffects) {
            };
            Experiments.prototype.cylinderMaterial = function (context, mesh, material, useEffects) {
            };
            Experiments.prototype.useAmbientOcclusion = function (context) {
                var ssao = new BABYLON.SSAORenderingPipeline('ssaopipeline', context.scene, 0.75);
                context.scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("ssaopipeline", context.camera);
                //this.scene.postProcessRenderPipelineManager.detachCamerasFromRenderPipeline("ssaopipeline", this.camera);
            };
            Experiments.prototype.useHDR = function (context) {
                var hdr = new BABYLON.HDRRenderingPipeline("hdr", context.scene, 1.0, null, [context.camera]);
                // About gaussian blur : http://homepages.inf.ed.ac.uk/rbf/HIPR2/gsmooth.htm
                hdr.brightThreshold = 1.2; // Minimum luminance needed to compute HDR
                hdr.gaussCoeff = 0.3; // Gaussian coefficient = gaussCoeff * theEffectOutput;
                hdr.gaussMean = 1; // The Gaussian blur mean
                hdr.gaussStandDev = 0.8; // Standard Deviation of the gaussian blur.
                hdr.exposure = 1; // Controls the overall intensity of the pipeline
                hdr.minimumLuminance = 0.5; // Minimum luminance that the post-process can output. Luminance is >= 0
                hdr.maximumLuminance = 1e10; //Maximum luminance that the post-process can output. Must be suprerior to minimumLuminance 
                hdr.luminanceDecreaseRate = 0.5; // Decrease rate: white to dark
                hdr.luminanceIncreaserate = 0.5; // Increase rate: dark to white
                context.scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("hdr", [context.camera]);
                //this.scene.postProcessRenderPipelineManager.detachCamerasFromRenderPipeline("hdr", [this.camera]);
            };
            Experiments.prototype.useLensEffect = function (context) {
                var lensEffect = new BABYLON.LensRenderingPipeline('lens', {
                    edge_blur: 0.2,
                    chromatic_aberration: 0.2,
                    distortion: 0.2,
                    dof_focus_depth: 100 / context.camera.maxZ,
                    dof_aperture: 1.0,
                    grain_amount: 0.2,
                    dof_pentagon: true,
                    dof_gain: 1.0,
                    dof_threshold: 1.0,
                }, context.scene, 1.0, [context.camera]);
            };
            return Experiments;
        })();
        ViewModes.Experiments = Experiments;
    })(ViewModes = Molvwr.ViewModes || (Molvwr.ViewModes = {}));
})(Molvwr || (Molvwr = {}));
