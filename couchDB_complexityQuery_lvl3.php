<?php
    $fp=fopen("couchDB_complexityQuery_lvl3.txt","a");
    fputs ($fp, $_POST['str']);
    fclose ($fp);	
?>
