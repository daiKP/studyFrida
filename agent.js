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
    const activityThread = Java.use("android.app.ActivityThread");
    const activity = Java.use("android.app.Activity");
    const activityClientRecord = Java.use("android.app.ActivityThread$ActivityClientRecord");
    const currentActivityThread = activityThread.currentActivityThread();
    const activityRecords = currentActivityThread.mActivities.value.values().toArray();
    let currentActivity;
    for (const i of activityRecords) {
        const activityRecord = Java.cast(i, activityClientRecord);
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
    const commonPaths = [
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
    const JavaFile=Java.use("Java.io.File");
    JavaFile.exists.implementation=function(){
        const filename=this.getAbsolutePath();
        if(commonPaths.indexOf(filename)>=0)
            return false;
        return this.exists.call(this);
    }
    //detect */*su
    const JavaRuntime=Java.use("java.lang.Runtime");
    const iOException = Java.use("java.io.IOException");
    JavaRuntime.exec.overload("java.lang.String").implementation=function(cmd){
        if(cmd.enddWith("su")){
            throw iOException.$new("anti-root");
        }
        return this.exec.overload("java.lang.String").call(this,cmd);
    }
}
function start(){
    init();
    bypassSuCheck();
}