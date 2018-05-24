<?php
    $fp=fopen("mongoDB_complexityQuery_lvl1.txt","a");
    fputs ($fp, $_POST['str']);
    fclose ($fp);	
?>
