<?php
    session_start();
?>

<?php
    if(isset($_POST['loginbtn'])){
        if(empty($_POST['login']) || empty($_POST['password'])){
            $_SESSION['error'] = 'Wpisz login i hasło';
            header('Location: index.php');
            exit();
        }
    }
?>

<?php
    $login = $_POST['login'];
    $password = $_POST['password'];

    require_once('database/database.php');
    try {
        $connection = new mysqli($server, $user, $pass, $database);
    }
    catch (mysqli_sql_exception $e){
        $_SESSION['error'] = "Brak połączenia z bazą danych<br>Spróbuj ponownie";
        header('Location: index.php');
        exit();
    }

    $login = htmlentities($login);
    $password = htmlentities($password);
    $login = $connection -> real_escape_string($login);
    $password = $connection -> real_escape_string($password);

    $query = "SELECT login FROM users WHERE login='$login'";
    $result = $connection -> query($query);

    if($result -> num_rows == 1){
        $query = "SELECT password FROM users WHERE login='$login'";
        $result = $connection -> query($query);
        $cell = $result -> fetch_assoc();

        if(password_verify($password, $cell['password'])){
            $_SESSION['user'] = $login;
            $query = "SELECT nickname FROM users WHERE login='$login'";
            $result = $connection -> query($query);
            $cell = $result -> fetch_assoc();
            $_SESSION['nickname'] = $cell['nickname'];
            header('Location: homepage.php');
            $connection -> close();
        }
        else {
            $_SESSION['error'] = 'Błędne hasło';
            header('Location: index.php');
            exit();
        }
    }
    else {
        $_SESSION['error'] = 'Błędny login';
        header('Location: index.php');
        exit();
    }

?>
