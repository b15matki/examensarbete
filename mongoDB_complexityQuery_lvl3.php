<?php
    $fp=fopen("mongoDB_complexityQuery_lvl3.txt","a");
    fputs ($fp, $_POST['str']);
    fclose ($fp);	
?>
