<?php
    $fp=fopen("couchDB_query2.txt","a");
    fputs ($fp, $_POST['str']);
    fclose ($fp);	
?>