package com.example.mobile

import android.app.Application
import android.content.Context

class EnergyMonitorApp : Application() {
    override fun onCreate() {
        super.onCreate()
        AppContextHolder.context = applicationContext
    }
}

object AppContextHolder {
    var context: Context? = null
}