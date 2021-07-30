//to get ClassLoader Unpacked
function init(){
    var application=Java.use("android.app.Application");
    application.attach.overload("android.content.Context").implementation=function(context){
        var retVar=this.attach(context);
        var clazzloader=context.getClassLoader();
        Java.classFactory.loader=clazzloader;
        bypassSuCheck();
        return retVar;
    }
}
//stack trace
function stack_trace(mode=0){
    if(mode!=1)
        return;
    var Exception =Java.use("java.lang.Exception");
    var ExceObj=Exception.$new("Exception");
    var straces=ExceObj.getStackTrace();
    if(undefined == straces ||null==straces){
        return;
    }
    console.log("======================Stack Top======================");
    for (let i of straces)
        console.log("    "+i.toString());
    console.log("======================Stack Low======================")
    Exception.$dispose();
}
//do sth before exit
function disexit(){
    var System=Java.use("java.lang.System");
    System.exit.implementation=function(){
        stack_trace();
        this.apply(this,arguments);
    }
}
//get current Activity copid  from objection 
function getCurrentActivity(){
    var activityThread = Java.use("android.app.ActivityThread");
    var activity = Java.use("android.app.Activity");
    var activityClientRecord = Java.use("android.app.ActivityThread$ActivityClientRecord");
    var currentActivityThread = activityThread.currentActivityThread();
    var activityRecords = currentActivityThread.mActivities.value.values().toArray();
    let currentActivity;
    for (var i of activityRecords) {
        var activityRecord = Java.cast(i, activityClientRecord);
        if (!activityRecord.paused.value) {
            currentActivity = Java.cast(Java.cast(activityRecord, activityClientRecord).activity.value, activity);
            break;
        }
    }
    if(currentActivity){
        return currentActivity.$className;
    }
}
//help to set Proxy
function setProxy(addr,port){
    var System=Java.use("java.lang.System");
    if(System!=undefined){
        System.setProperty("http.proxyHost",addr);
        System.setProperty("http.proxyPort",port);
        System.setProperty("https.proxyHost",addr);
        System.setProperty("https.proxyPort",port);
        console.log("proxy set to"+addr+":"+port);
    }
}
//algorithm watch
function watchAlgorithm(){
    
}
//bypassSuCheck
function bypassSuCheck(){
    var commonPaths = [
        "/data/local/bin/su",
        "/data/local/su",
        "/data/local/xbin/su",
        "/dev/com.koushikdutta.superuser.daemon/",
        "/sbin/su",
        "/system/app/Superuser.apk",
        "/system/bin/failsafe/su",
        "/system/bin/su",
        "/system/etc/init.d/99SuperSUDaemon",
        "/system/sd/xbin/su",
        "/system/xbin/busybox",
        "/system/xbin/daemonsu",
        "/system/xbin/su",
    ];
    //detect file Exits
    var JavaFile=Java.use("java.io.File");
    JavaFile.exists.implementation=function(){
        var filename=this.getAbsolutePath();
        if(commonPaths.indexOf(filename)>=0)
            return false;
        return this.exists.call(this);
    }
    //detect */*su
    var JavaRuntime=Java.use("java.lang.Runtime");
    var iOException = Java.use("java.io.IOException");
    JavaRuntime.exec.overload("java.lang.String").implementation=function(cmd){
        if(cmd.endsWith("su")){
            throw iOException.$new("anti-root");
        }
        return this.exec.overload("java.lang.String").call(this,cmd);
    }

    //bypass com.scottyab.rootbeer
    try{
        var rootbeerB=Java.use("com.scottyab.rootbeer.b");
        if(rootbeerB){
            console.log("detect RootBeer");
            rootbeerB.n.implementation=function(){
                return false;
            }
        }   
    }catch(err){
        console.log(err);
    }
}
//print byte array
function printBytes(bytes){
    var JavaBytes=Java.use("[B");
    var bytesarray=Java.cast(bytes,JavaBytes);
    var array=Java.array("byte",bytesarray);
    console.log(JSON.stringify(array));
}
function addWRFile2List(filename,mode){
    switch(mode){
        case 0:
            if(handle[fp]["open"].indexOf(filename)<0)
                handle[fp]["open"].push(filename);
            break;
        case 1:
            if(handle[fp]["read"].indexOf(filename)<0)
                handle[fp]["read"].push(filename);
            break;
        case 2:
            if(handle[fp]["write"].indexOf(filename)<0)
                handle[fp]["write"].push(filename);
    }
}
function checkinList(filename)
{

}
//watch file wr behavior
function watchFileBehavior(mode=0,watchFileName="ZOPIASDUIOP"){
    
    var JavaFile=Java.use("java.io.File");
    JavaFile.$init.overload("java.lang.String").implementation=function(filePath){
        if(filePath.indexOf(ignorepath[0])<0){
            console.log("file Object :"+filePath)
            addWRFile2List(filePath,0);
        }
        return this.$init(filePath);
    }
    var javaFileInputStream=Java.use("java.io.FileInputStream");
    javaFileInputStream.read.overloads.forEach(function(overload){
        var args=overload.argumentTypes.map((arg)=>arg.className);
        overload.implementation=function(){
            var filepath=this.path.value;
            if(filepath.indexOf)
            addWRFile2List(filepath,1)
            console.log("FileInputStream.read path is: "+filepath);
            stack_trace(mode);
            //console.log("FileInputStream("+args+")");
            if(args.indexOf("[B")<0){
                var ret=overload.apply(this,arguments);
                console.log("read a Byte:"+ret);
                return ret;
            }
            else{
                ret=overload.apply(this,arguments);
                if(mode==1)
                {
                    console.log("offset:"+arguments[1]+" lenth:"+arguments[2]+"read Bytes:")
                    printBytes(arguments[0]);
                }
                return ret;
            }
        }
    });
    var javaFileOutputStream=Java.use("java.io.FileOutputStream");
    javaFileOutputStream.write.overloads.forEach(function(overload){
        var args=overload.argumentTypes.map((arg)=>arg.className);
        var argslist=args.join(", ")
        overload.implementation=function(){
            var filepath=this.path.value;
            if(filepath.indexOf(watchFileName)>-1){
                stack_trace(1);
            }
            addWRFile2List(filepath,2);
            console.log("FileOutputStream.write path is: "+filepath);
            stack_trace(mode);
            if(filepath.indexOf(watchFileBehavior)>-1){
                stack_trace(1);
            }
            console.log("FileOutputStream("+argslist+")")
            if(argslist.indexOf("[B")>=-1){
                console.log("write bytes array:");
                if(mode==1){
                    if(argslist.indexOf("int")>=0)
                        console.log("offset:"+arguments[1]+",lenth:"+arguments[2]);
                printBytes(arguments[0]);
                }
            }
            else{
                console.log(arguments[0]);
            }
            return overload.apply(this,arguments);
        }
    });

    //native 
    //Interceptor.attach(
    //    Module.findExportByName("libc.so","open"),{
    //        onEnter:function(args){
    //            var path=Memory.readCString(args[0])
    //            addWRFile2List(path,0);
    //        },
    //        onLeave:function(ret){
    //            handle[fp]["native-fd"]["fd-"+ret.toInt32()]=path;
    //        }
    //    }
    //)
    //Interceptor.attach(Module.findExportByName("libc.so","read"),{
    //    onEnter:function(args){
    //        var path=(handle[fp]['native-fd']['fd'+args[0].toInt32]!=null)?handle[fp]['native-fd']//['fd'+args[0].toInt32]:"[Unknow]";
    //        addWRFile2List(path,1);
    //    },onLeave:function(ret){
//
    //    }
    //}
    //);
}
function getInsField(inshashcode){
    let tInstance;
    Object.keys(handle[ins]).forEach((classname)=>{
        handle[ins][classname].filter((heapObject)=>{
            if(heapObject.hashcode===inshashcode)
                tInstance=heapObject.instance;
        })
    });
    var allField=tInstance.class.getDeclaredFields().map((field)=>{
        var fieldName=field.getName();
        var fieldInstance=tInstance.class.getDeclaredFields(fieldName);
        fieldInstance.setAccessible(true);

        let fieldValue=fieldInstance.get(tInstance);
        if(fieldValue)
            fieldValue=fieldValue.toString();
        
        return{
            name:fieldName,
            value:fieldValue,
        };
    });
    console.log("FieldName   FieldValue");
    allField.forEach(function(field){
        console.log(field.name+"    "+field.value);
    })
}
function getInstances(className) {
    try{
        Java.choose(className, {onComplete(){
            console.log("all instanse out");
        },onMatch(instanse){
            var insi=Java.cast(instanse,Java.use(className));
            handle[ins][className].push({
                instance:insi,
                hashcode:instanse.hashCode(),
            });
        }
        })
    }catch(err){
        console.log(err)
    }
    console.log("find instances:");
    console.log("Instance       hashcode");
    handle[ins][className].forEach((instance)=>{
        console.log(instance.instance.toString()+"     "+instance.hashcode);
    })
}
function enumClassLoaded(name){
    Java.enumerateLoadedClasses({
        onMatch(clazz){
            if(clazz.indexOf(name)>=0)
                console.log(clazz);
        },
        onComplete(){
            console.log("complete");
        }
    })
}
function pt_file()
{
    console.log("file used----------------------------")
    handle[fp]["open"].forEach(function(filepath){
        console.log(filepath);
    });
    console.log("file read----------------------------")
    handle[fp]["read"].forEach(function(filepath){
        console.log(filepath);
    });
    console.log("file write---------------------------")
    handle[fp]["write"].forEach(function(filepath){
        console.log(filepath)
    })
}
//screencap to
function screencap(mode){
    const MODE_SYSTEM_SCREENCAP=1;
    const MODE_VIEW_DRAWCACHE=2;
    switch(mode){
        case MODE_SYSTEM_SCREENCAP:
            {
                var Runtime=Java.use("java.lang.Runtime");
                Runtime.getRuntime().exec("screencap ./temp.png");
                var javaFile=Java.use("java.io.File");
                break;
            }
        case MODE_VIEW_DRAWCACHE:{
            
        }
    }
}
//trace class's all methods
function traceClass(clsname) {
    try {
        var target = Java.use(clsname);
        var methods = target.class.getDeclaredMethods();
        methods.forEach(function (method) {
            var methodName = method.getName();
            var overloads = target[methodName].overloads;
            overloads.forEach(function (overload) {
                var proto = "(";
                overload.argumentTypes.forEach(function (type) {
                    proto += type.className + ", ";
                });
                if (proto.length > 1) {
                    proto = proto.substr(0, proto.length - 2);
                }
                proto += ")";
                log("hooking: " + clsname + "." + methodName + proto);
                overload.implementation = function () {
                    var args = [];
                    var tid = getTid();
                    var tName = getTName();
                    for (var j = 0; j < arguments.length; j++) {
                        args[j] = arguments[j] + ""
                    }
                    console.log(tid+ tName+ clsname+methodName + proto+"args "+ args);
                    var retval = this[methodName].apply(this, arguments);
                    exit(tid, "" + retval);
                    return retval;
                }
            });
        });
    } catch (e) {
        log("'" + clsname + "' hook fail: " + e)
    }
}
//set FLAG
function setFlagP(){
    
}
function start(){
    
    init();
    disexit()
    
    //watchFileBehavior(0);
}
const fp="FilePath";
const ins="Instances";
let handle={}
handle[fp]=[]
handle[fp]["open"]=[]
handle[fp]["read"]=[]
handle[fp]["write"]=[]
handle[fp]["native-fd"]=[]
var ignorepath=["/storage/emulated/0"]

Java.perform(function(){
    start();
})