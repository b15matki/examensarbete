<?php
    $fp=fopen("couchDB_complexityQuery_lvl1.txt","a");
    fputs ($fp, $_POST['str']);
    fclose ($fp);	
?>
