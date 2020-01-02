    //////////////////////////////////////////////////////////////////////////////////
	//		Init
    //////////////////////////////////////////////////////////////////////////////////
    var arWorldRoot;
    var arToolkitSource;
    var arToolkitContext;
    var renderer;
    var objects = [];

    var global_imageData;
    var global_grayImageData;

    function initViewer(){

        // init renderer
        renderer = new THREE.WebGLRenderer({
            // antialias	: true,
            alpha: true
        });
        renderer.setClearColor(new THREE.Color('lightgrey'), 0)
        // renderer.setPixelRatio( 1/2 );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.domElement.style.position = 'absolute'
        renderer.domElement.style.top = '0px'
        renderer.domElement.style.left = '0px'
        renderer.shadowMap.enabled = true;
        renderer.domElement.id = "threeCanvas";
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild( renderer.domElement );

        // array of functions for the rendering loop
        var onRenderFcts= [];

        // init scene and camera
        var scene	= new THREE.Scene();
        
        var light = new THREE.AmbientLight("rgb(255, 255, 255)", 1); // soft white light
        scene.add(light);

        var spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(5, 5, 5);

        spotLight.castShadow = true;

        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;

        spotLight.shadow.camera.near = 500;
        spotLight.shadow.camera.far = 4000;
        spotLight.shadow.camera.fov = 30;

        scene.add(spotLight);

        //////////////////////////////////////////////////////////////////////////////////
        //		Initialize a basic camera
        //////////////////////////////////////////////////////////////////////////////////

        // Create a camera
        var camera = new THREE.Camera();
        scene.add(camera);

        ////////////////////////////////////////////////////////////////////////////////
        //          handle arToolkitSource
        ////////////////////////////////////////////////////////////////////////////////

        arToolkitSource = new THREEx.ArToolkitSource({
            // to read from the webcam 
            sourceType : 'webcam',

            // to read from an image
            // sourceType : 'image',
            // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/images/img.jpg',		

            // to read from a video
            // sourceType : 'video',
            // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/videos/headtracking.mp4',		
        })
       
        arToolkitSource.init(function onReady(){
            onResize()
        })
        arToolkitSource.domElement.id="videoAr";
        // handle resize
        window.addEventListener('resize', function(){
            onResize()
        })
        
        
        ////////////////////////////////////////////////////////////////////////////////
        //          initialize arToolkitContext
        ////////////////////////////////////////////////////////////////////////////////
        

        // create atToolkitContext
        arToolkitContext = new THREEx.ArToolkitContext({
            cameraParametersUrl: './data/camera/camera_para.dat',
            detectionMode: 'mono',
            maxDetectionRate: 30,
            canvasWidth: 80*3,
            canvasHeight: 60*3,
        })
        // initialize it
        arToolkitContext.init(function onCompleted(){
            // copy projection matrix to camera
            camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
        })

        // update artoolkit on every frame
        onRenderFcts.push(function(){
            if( arToolkitSource.ready === false )	return
            // console.log(arToolkitContext)
            arToolkitContext.update( arToolkitSource.domElement )
        })
        
        
        ////////////////////////////////////////////////////////////////////////////////
        //          Create a ArMarkerControls
        ////////////////////////////////////////////////////////////////////////////////
        
        var markerRoot = new THREE.Group()
        scene.add(markerRoot)

        var artoolkitMarker = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
            type : 'pattern',
            patternUrl :'./data/markers/patt.hiro'
            // patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.kanji'
        })

        // build a smoothedControls
        var smoothedRoot = new THREE.Group()
        scene.add(smoothedRoot)
        var smoothedControls = new THREEx.ArSmoothedControls(smoothedRoot, {
            lerpPosition: 0.4,
            lerpQuaternion: 0.3,
            lerpScale: 1,
        })
        onRenderFcts.push(function(delta){
            smoothedControls.update(markerRoot)
        })
        //////////////////////////////////////////////////////////////////////////////////
        //		add an object in the scene
        //////////////////////////////////////////////////////////////////////////////////

        arWorldRoot = smoothedRoot;

        var geometry = new THREE.BoxGeometry( 1, 1, 1 );
        var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        var cube = new THREE.Mesh( geometry, material );

        arWorldRoot.add( cube );

        

        //////////////////////////////////////////////////////////////////////////////////
        //		render the whole thing on the page
        //////////////////////////////////////////////////////////////////////////////////

        // render the scene
        onRenderFcts.push(function(){
           
            renderer.render( scene, camera );
            
        })

        // run the rendering loop
        var lastTimeMsec= null
        requestAnimationFrame(function animate(nowMsec){
           
            // keep looping
            requestAnimationFrame( animate );
            // measure time
            lastTimeMsec	= lastTimeMsec || nowMsec-1000/60;
            var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec);
            lastTimeMsec	= nowMsec;
            getFrame();
            // call each update function
            onRenderFcts.forEach(function(onRenderFct){
                
                onRenderFct(deltaMsec/1000, nowMsec/1000)
            })
            
        })

        window.addEventListener('click', function(){setAverageColor(global_imageData)});
        
        // window.addEventListener('click', function(){clicks()});
    }

    function onResize(){
		arToolkitSource.onResize()	
		arToolkitSource.copySizeTo(renderer.domElement)	
		if( arToolkitContext.arController !== null ){
			arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)	
		}	
    }
    
    function getFrame(){
        let result = document.getElementById("result");

        let threeCanvas = document.getElementById("threeCanvas");
        threeCanvas.style.display = "none";
        
        let videoAr = document.getElementById("videoAr");
        
        let w = videoAr.style.width;
        let h =  videoAr.style.height;
        // console.log(w,h)
        result.style.width = w;
        result.style.height = h;
        result.style.marginLeft = threeCanvas.style.marginLeft;
        result.style.marginTop = threeCanvas.style.marginTop;

        let resultctx = result.getContext('2d');
        resultctx.drawImage(videoAr,0,0, 300,150);
        
        // videoAr.style.display = "none";
        
        let imageData = resultctx.getImageData(0, 0, 300,150);
        global_imageData = imageData;
        var grayImageData = resultctx.createImageData(imageData);
        global_grayImageData = grayImageData;
        // rgbToGrayscale(imageData.data, grayImageData.data);
        setToBW(imageData, grayImageData.data);
        // applyGauBlur(imageData, grayImageData.data);
        resultctx.putImageData(grayImageData, 0, 0);
        // resultctx.clearRect(0,0,300,150);
        // console.log(grayData)
        
    }

 

window.onload = initViewer;