<?php
    $fp=fopen("mongoDB_query2.txt","a");
    fputs ($fp, $_POST['str']);
    fclose ($fp);	
?>
