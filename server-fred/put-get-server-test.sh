#! /bin/sh
#
# Test script for PUT/GET server.

# make sure we have the commands we need.
for cmd in tempfile date curl diff
do
  test -x `which ${cmd}` || exit 1
done

server="127.0.0.1:8124"
file="209871039874"  # some random string
url="http://${server}/${file}?q=monkey&r=oiks"

# temporary files
srcfile=$(tempfile --directory=/tmp --prefix=bla)
outfile=$(tempfile --directory=/tmp --prefix=bla)

# generate some stuff
(
  date
  ls -l
  date
) > ${srcfile}

# How to set headers:
#  -H "Host: www.foo.org"
#  -H "Content-Type: text/xml"

curl --silent -T ${srcfile} "${url}"  # PUT
curl --silent -o ${outfile} "${url}"  # GET

# compare
if diff ${srcfile} ${outfile}
then
  rm -f ${srcfile} ${outfile}
  echo "PASS"
  exit 0
else
  rm -f ${srcfile} ${outfile}
  echo "FAIL"
  exit 1
fi
