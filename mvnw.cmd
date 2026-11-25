@echo off
setlocal
for %%i in ("%~dp0.") do set "MAVEN_PROJECTBASEDIR=%%~fi"
set "WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"

if not exist "%WRAPPER_JAR%" (
    echo Maven Wrapper JAR not found: "%WRAPPER_JAR%"
    exit /b 1
)

if defined JAVA_HOME (
    set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
) else (
    set "JAVA_EXE=java.exe"
)

"%JAVA_EXE%" -Dmaven.multiModuleProjectDirectory="%MAVEN_PROJECTBASEDIR%" -classpath "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
set "MAVEN_WRAPPER_EXIT_CODE=%ERRORLEVEL%"
endlocal & exit /b %MAVEN_WRAPPER_EXIT_CODE%
