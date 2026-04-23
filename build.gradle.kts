plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.buildDir = "${rootProject.rootDir}/build"
subprojects {
    project.buildDir = "${rootProject.buildDir}/${project.name}"
}

subprojects {
    afterEvaluate {
        if (plugins.hasPlugin("com.android.application")) {
            configure<com.android.build.api.dsl.ApplicationExtension> {
                buildFeatures {
                    compose = true
                }
                composeOptions {
                    kotlinCompilerExtensionVersion = libs.versions.compose.compiler.get()
                }
            }
        }
    }
}
