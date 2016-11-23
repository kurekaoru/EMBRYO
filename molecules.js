var MolvwrSamples = MolvwrSamples || {};


(function(){
	'use strict';

	MolvwrSamples.Rendering = {
		Toon : function(){
			return null;
		},
		
		Rocks : function(){
			var viewmodeOptions = Molvwr.ViewModes.Standard.defaultConfig();
			viewmodeOptions.sphere.bumpTexture = "textures/15_NORMAL.jpg";
			//viewmodeOptions.sphere.diffuseTexture = "textures/03_DIFFUSE.jpg",
			viewmodeOptions.sphere.specularTexture = "textures/15_DIFFUSE.jpg",
			viewmodeOptions.sphere.textureScale = 1;
			viewmodeOptions.cylinder.bumpTexture = "textures/15_NORMAL.jpg";
			viewmodeOptions.cylinder.specularTexture = "textures/15_DIFFUSE.jpg",
			viewmodeOptions.cylinder.textureScale = 1;
			viewmodeOptions.emisivefresnel.bias = 0.4;
			return new Molvwr.ViewModes.Standard(viewmodeOptions);
		},
	};

	MolvwrSamples.viewmodes = [
		{ name : "View type", id:"viewtype", inline: true, childs: [
			{ name : 'Spheres', id:"spheres", type:"viewtype", cfg : Molvwr.Config.spheres},
			{ name : 'Balls and sticks', id:"ballsandsticks", type:"viewtype", cfg : Molvwr.Config.ballsAndSticks},
			{ name : 'Sticks', id:"sticks", type:"viewtype", cfg : Molvwr.Config.sticks},
			]},
		{ name : "Texture", id:"rendering", type:"rendering", inline: true, childs: [
			{ name : 'Flat', id:"flat", type:"rendering", cfg : MolvwrSamples.Rendering.Toon },
			{ name : 'Rocks', id:"rocks", type:"rendering", cfg : MolvwrSamples.Rendering.Rocks},
		]}
	];

	MolvwrSamples.molecules = [
		{ name : "Embryos", id:"embryos", childs: [
			{ name : "130619PHA4p2:020", id:"130619PHA4p2_020CN", url: "molsamples/embryos/CD130619PHA4p2_020_CN.txt", format: "mol"},
			{ name : "130619PHA4p2:005", id:"130619PHA4p2_005CN", url: "molsamples/embryos/CD130619PHA4p2_005CN.txt", format: "mol"},
			{ name : "130619PHA4p2:100", id:"130619PHA4p2_100", url: "molsamples/embryos/130619PHA4p2/130619PHA4p2_100.txt", format: "mol"},
			{ name : "130619PHA4p2:200", id:"130619PHA4p2_200", url: "molsamples/embryos/130619PHA4p2/130619PHA4p2_200.txt", format: "mol"},
			{ name : "130604PHA4cdk4ip2:050", id:"130604PHA4cdk4ip2_050", url: "molsamples/embryos/130604PHA4cdk4ip2_050.txt", format: "mol"},
			{ name : "130604PHA4cdk4ip2:100", id:"130604PHA4cdk4ip2_100", url: "molsamples/embryos/130604PHA4cdk4ip2_100.txt", format: "mol"},
			{ name : "TESTER", id:"TESTER", url: "molsamples/embryos/TESTER.txt", format: "mol"},	
			{ name : "ASPIRIN", id:"ASPIRIN", url: "molsamples/embryos/aspirin2.txt", format: "mol"},				
		]},
		
	];
})();



