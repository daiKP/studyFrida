//to get ClassLoader Unpacked
function init(){
    var application=Java.use("android.app.Application");
    application.attach.overload("android.content.Context").implementation=function(context){
        var retVar=this.attach(context);
        var clazzloader=context.getClassLoader();
        Java.classFactory.loader=clazzloader;
        return retVar;
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
        if(cmd.enddWith("su")){
            throw iOException.$new("anti-root");
        }
        return this.exec.overload("java.lang.String").call(this,cmd);
    }
}
//watch file wr behavior
function watchFileBehavior(){
    var JavaFile=Java.use("java.io.File");
    JavaFile.$init.overload("java.lang.String").implementation=function(filePath){
        console.log("file Object  new"+filePath)
        var ret=this.$init(filePath);
        return ret;
    }

    var javaFileInputStream=Java.use("java.io.FileInputStream");
    javaFileInputStream.read.overloads.forEach(function(overload){
        overload.implementation=function(){
            var filepath=this.path.value;
            console.log("FileInputStream.read path is: "+filepath);
            return this.apply(this,arguments);
        }
    });

    var javaFileOutputStream=Java.use("java.io.FileOutputStream");
    javaFileOutputStream.write.overloads.forEach(function(overload){
        overload.implementation=function(){
            var filepath=this.path.value;
            console.log("FileOutputStream.write path is: "+filepath);
            return overload.call(this,arguments);
        }
    });
    Interceptor.
    //var FileWrites=JavaFile["write"].overloads;
    //FileWrites.forEach(function(overload){
    //    overload.implementation=function(){
    //        console.log("file write "+this.getAbsolutePath());
    //        return overload.apply(this,arguments);
    //    }
    //});
    //var FileReads=JavaFile["read"].overloads;
    //FileReads.forEach(function(overload){
    //    overload.implementation=function(){
    //        console.log("file read "+this.getAbsolutePath());
    //        return overload.apply(this,arguments);
    //    }
    //});
}
function start(){
    init();
    bypassSuCheck();
}