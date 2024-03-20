# Pretests

This is the location for tests have to be run in order for other tests to run.

This is generally a BAD IDEA. In most cases, tests which use the output from earlier tests
should be part of the same feature file.

The only tests that should be in this directory are the ones which test whether the environment can be set up at all.  (e.g. If site sections can't be created, then very likely nothing else is going to work either.)
