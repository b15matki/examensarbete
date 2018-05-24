<?php
    $fp=fopen("mongoDB_query3.txt","a");
    fputs ($fp, $_POST['str']);
    fclose ($fp);	
?>
